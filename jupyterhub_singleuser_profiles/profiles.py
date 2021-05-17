import kubernetes
import os
import yaml
import json
import logging
import re
from kubernetes.client import V1EnvVar, V1ResourceRequirements, V1ConfigMap, V1ObjectMeta, V1SecurityContext, V1Capabilities, V1SELinuxOptions, V1Secret, V1Volume, V1VolumeMount, V1PersistentVolumeClaimVolumeSource

from .service import Service
from .utils import escape, parse_resources
from .sizes import Sizes
from .images import Images
from .ui_config import UIConfig
from .openshift import OpenShift
from .user import User


_LOGGER = logging.getLogger(__name__)

_JUPYTERHUB_USER_NAME_ENV = "JUPYTERHUB_USER_NAME"
_USER_CONFIG_PROFILE_NAME = "@singleuser@"
_GPU_KEY = "nvidia.com/gpu"

class SingleuserProfiles(object):
  GPU_MODE_SELINUX = "selinux"
  GPU_MODE_PRIVILEGED = "privileged"
  def __init__(self, namespace=None, verify_ssl=True, gpu_mode=None, service_account_path='/var/run/secrets/kubernetes.io/serviceaccount'):
    self.profiles = []
    self.namespace = None
    self.gpu_types = []
    self.gpu_mode = gpu_mode

    self.openshift = OpenShift(namespace=namespace, verify_ssl=verify_ssl)
    self.namespace = self.openshift.namespace

    self.service = Service(self.openshift, self.namespace)
    self.images = Images(self.openshift, namespace=namespace)
    self.user = User(self.openshift, default_image=self.images.get_default())

  @property
  def gpu_mode(self):
    return self._gpu_mode

  @gpu_mode.setter
  def gpu_mode(self, value):
    if value == self.GPU_MODE_PRIVILEGED:
      self._gpu_mode = self.GPU_MODE_PRIVILEGED
    elif value == self.GPU_MODE_SELINUX:
      self._gpu_mode = self.GPU_MODE_SELINUX
    else:
      self._gpu_mode = None
  
  def load_profiles(self, secret_name="jupyter-singleuser-profiles", filename=None, key_name="jupyterhub-singleuser-profiles.yaml", username=None):
    self.gpu_types = []
    self.profiles = []
    self.sizes = []
    self.ui = {}
    if self.openshift.api_client:
      profiles_config_maps = [secret_name]
      profiles_config_maps.extend(sorted(self.openshift.get_config_maps_matching_label()))
      for cm_name in profiles_config_maps:
        config_map_yaml = self.openshift.read_config_map(cm_name, key_name)
        if config_map_yaml:
          self.gpu_types.extend(config_map_yaml.get("gpuTypes", []))
          self.sizes.extend(config_map_yaml.get("sizes", []))
          self.profiles.extend(config_map_yaml.get("profiles", [self.empty_profile()]))
          self.ui = {**self.ui, **config_map_yaml.get("ui", {})}
        else:
          _LOGGER.error("Could not find config map %s" % cm_name)
      if len(self.profiles) == 0:
        self.profiles.append(self.empty_profile())
      if username:
        config_map_yaml = self.user.get(username, for_k8s=True)
        if config_map_yaml:
          if not config_map_yaml.get('name'):
            config_map_yaml['name'] = _USER_CONFIG_PROFILE_NAME
          self.profiles.append(config_map_yaml)
    else:
      with open(filename) as fp:
        data = yaml.load(fp)
        if len(data["data"][key_name]) > 0:
          self.profiles.extend(yaml.load(data["data"][key_name]).get("profiles", [self.empty_profile()]))
        else:
          self.profiles.append(self.empty_profile())

  def filter_by_username(self, profile, user):
    if not user or not profile.get("users") or "*" in profile.get("users", []):
      return profile
    if user in profile.get("users", []):
      _LOGGER.info("Found profile '%s' for user %s" % (profile.get("name"), user))
      return profile
    return {}

  def get_profile_by_image(self, image, user=None):
    for profile in self.profiles:
      if profile.get("images") and len(profile.get("images")) > 0:
        if image in profile.get("images"):
          _LOGGER.info("Found profile for image %s" % image)
          yield self.filter_by_username(profile, user)
      else:
        yield self.filter_by_username(profile, user)

    return iter(())

  def get_merged_profile(self, image, user=None, size=None):
    profile = self.get_profile_by_image(image, user)
    res = self.empty_profile()
    for p in profile:
      res = self.merge_profiles(res, p)

    if size:
      s = Sizes(self.sizes)
      loaded_size = s.get_size(size)
      if loaded_size:
        res = self.merge_profiles(res, loaded_size)

    return res

  def get_profile_by_name(self, name):
    for profile in self.profiles:
      if profile.get("name") == name:
        return profile

    return {}

  def setup_services(self, spawner, image, user):
    profile = self.get_merged_profile(image, user)
    if profile.get("services"):
      deployed_services, env_groups = self.service.deploy_services(profile.get("services"), user)
      for envs in env_groups:
        if not envs:
          continue
        spawner.environment = {**spawner.environment, **envs}
      for deployed_service in deployed_services:
        spawner.single_user_services.append(deployed_service.get("metadata", {}).get("name"))


  def clean_services(self, spawner, user):
    self.service.delete_reference_cm(user)

  def get_ui_configuration(self):
    ui = UIConfig(self.ui, self.openshift)
    return ui.validate_ui_cm()

  def get_sizes_form(self, username=None):
    if not self.profiles:
      self.load_profiles(username=username)
    s = Sizes(self.sizes)
    return s.get_form(self.get_profile_by_name(_USER_CONFIG_PROFILE_NAME).get('last_selected_size'))

  def get_size(self, size):
    s = Sizes(self.sizes)
    return s.get_size(size)
    
  def get_sizes(self):
    return self.sizes

  def get_image_info(self, image_name):
    return self.images.get_info(image_name)

  def get_gpu_types(self):
    return self.gpu_types

  @classmethod
  def empty_profile(self):
    return {
      "name": "",
      "users": [],
      "images": [],
      "env": {},
      "node_tolerations": [],
      "node_affinity": {},
      "resources": {},
      "services": {}
    }

  @classmethod
  def env_dict_to_list(self, env_data):
    result = []
    
    for k, v in env_data.items():
      result.append({"name": k, "value": v})

    return result

  @classmethod
  def merge_profiles(self, profile1, profile2):

    if isinstance(profile1.get('env'), dict):
      profile1['env'] = self.env_dict_to_list(profile1['env'])
    if isinstance(profile2.get('env'), dict):
      profile2['env'] = self.env_dict_to_list(profile2['env'])

    profile1["name"] =  ", ".join(filter(None, [profile1.get("name", ""), profile2.get("name", "")]))
    profile1["images"] = list(set(profile1.get("images", []) + profile2.get("images", [])))
    profile1["users"] = list(set(profile1.get("users", []) + profile2.get("users", [])))
    profile1["env"] = profile1.get('env', []) + profile2.get('env', [])
    profile1["volumes"] = profile1.get('volumes', []) + profile2.get('volumes', [])
    profile1["resources"] = {**profile1.get('resources', {}), **profile2.get('resources', {})}
    profile1["services"] = {**profile1.get('services', {}), **profile2.get('services', {})}
    profile1["node_tolerations"] = profile1.get("node_tolerations", []) + profile2.get("node_tolerations", [])
    profile1["node_affinity"] = {**profile1.get('node_affinity', {}), **profile2.get('node_affinity', {})}
    if profile2.get("gpu"):
      profile1["gpu"] = profile2.get("gpu")

    profile1['resources'] = parse_resources(profile1['resources'])

    return profile1


  @classmethod
  def apply_pod_schedulers(self, node_tolerations, node_affinity, pod):

    if not pod.spec.tolerations:
      pod.spec.tolerations = node_tolerations
    else:
      pod.spec.tolerations.extend(node_tolerations)

    if not pod.spec.affinity:
      pod.spec.affinity = {}
      pod.spec.affinity['nodeAffinity'] = node_affinity
    else:
      pod.spec.affinity['nodeAffinity'] = {**pod.spec.affinity.get('nodeAffinity', {}), **node_affinity}

    return None

  @classmethod
  def apply_gpu_config(self, gpu_mode, profile, gpu_types, pod, selected_gpu_type):
    gpu_count = profile.get('gpu', 0)
    node_tolerations = []
    node_affinity = {}

    if int(gpu_count) > 0:
      pod.spec.containers[0].resources.limits[_GPU_KEY] = str(gpu_count)
      pod.spec.containers[0].resources.requests[_GPU_KEY] = str(gpu_count)

      if gpu_mode:
        if gpu_mode == self.GPU_MODE_SELINUX:
          pod.spec.security_context.capabilities = V1Capabilities(drop=['ALL'])
          pod.spec.security_context.se_linux_options = V1SELinuxOptions(type='nvidia_container_t')

        if gpu_mode == self.GPU_MODE_PRIVILEGED:
          pod.spec.security_context.privileged = True

      if gpu_types:
        # We currently do not have a way to select the type of GPU in the notebook spawner
        # Our workaround for the time being is to apply all possible gpu tolerations
        if selected_gpu_type == "ALL":
          for gpu_type in gpu_types:
            node_tolerations.extend(gpu_type.get('node_tolerations', []))
        else:
          for gpu_type in gpu_types:
            if selected_gpu_type == gpu_type.get('type'):
              node_tolerations.extend(gpu_type.get('node_tolerations', []))
              break

    self.apply_pod_schedulers(node_tolerations, node_affinity, pod)

    return None

  @classmethod
  def generate_volume_path(self, mountPath, default_mount_path, volume_name):
    if (mountPath):
      if (os.path.isabs(mountPath)):
        return mountPath
      return os.path.join(default_mount_path, mountPath)
    return os.path.join(default_mount_path, volume_name)

  @classmethod
  def get_mem_limit(self, memory_limit):
    if 'Ti' in memory_limit:
      memory_limit = int(memory_limit[:-2]) * 1024 * 1024 * 1024 * 1024
    elif 'Gi' in memory_limit:
      memory_limit = int(memory_limit[:-2]) * 1024 * 1024 * 1024
    elif 'Mi' in memory_limit:
      memory_limit = int(memory_limit[:-2]) * 1024 * 1024
    elif 'Ki' in memory_limit:
      memory_limit = int(memory_limit[:-2]) * 1024

    return str(memory_limit)
    

  @classmethod
  def apply_pod_profile(self, username, pod, profile, gpu_types, default_mount_path, gpu_mode=None, selected_gpu_type="ALL"):
    api_client = kubernetes.client.ApiClient()

    pod.metadata.labels['jupyterhub.opendatahub.io/user'] = escape(username)

    profile_volumes = profile.get('volumes')

    if profile_volumes:
      for volume in profile_volumes:
        volume_name = re.sub('[^a-zA-Z0-9\.]', '-', volume['name']).lower()
        read_only = volume['persistentVolumeClaim'].get('readOnly')
        pvc = V1PersistentVolumeClaimVolumeSource(volume['persistentVolumeClaim']['claimName'], read_only=read_only)
        mount_path = self.generate_volume_path(volume.get('mountPath'), default_mount_path, volume_name)
        pod.spec.volumes.append(V1Volume(name=volume_name, persistent_volume_claim=pvc))
        pod.spec.containers[0].volume_mounts.append(V1VolumeMount(name=volume_name, mount_path=mount_path))

    profile_environment = profile.get('env')

    if profile_environment:

      # Kept for backwards compatibility with simplified env var definitions
      if isinstance(profile_environment, dict):
        for k, v in profile['env'].items():
          update = False
          for e in pod.spec.containers[0].env:
            if e.name == k:
              e.value = v
              update = True
              break
          if not update:
            pod.spec.containers[0].env.append(V1EnvVar(k, v))
            
      elif isinstance(profile_environment, list):
        for i in profile_environment:
          r = type("Response", (), {})
          r.data = json.dumps(i)
          env_var = api_client.deserialize(r, V1EnvVar)
          pod.spec.containers[0].env.append(env_var)
    
    resource_var = None
    resource_json = type("Response", (), {})
    resource_json.data = json.dumps(profile.get('resources'))
    resource_var = api_client.deserialize(resource_json, V1ResourceRequirements)

    if resource_var:
      pod.spec.containers[0].resources = resource_var
      mem_limit = resource_var.limits.get('memory', '')
      if mem_limit:
        pod.spec.containers[0].env.append(V1EnvVar(name='MEM_LIMIT', value=self.get_mem_limit(mem_limit)))

    for c in pod.spec.containers:
      update = False
      if type(c) is dict:
        env = c['env']
      else:
        env = c.env
      for e in env:
        if type(e) is dict:
          if e['name'] == _JUPYTERHUB_USER_NAME_ENV:
            e['value'] = username
            update = True
            break
        else:
          if e.name == _JUPYTERHUB_USER_NAME_ENV:
            e.value = username
            update = True
            break

      if not update:
        env.append(V1EnvVar(_JUPYTERHUB_USER_NAME_ENV, username))

    self.apply_gpu_config(gpu_mode, profile, gpu_types, pod, selected_gpu_type)

    node_tolerations = profile.get('node_tolerations', [])
    node_affinity = profile.get('node_affinity', {})

    self.apply_pod_schedulers(node_tolerations, node_affinity, pod)

    return pod
