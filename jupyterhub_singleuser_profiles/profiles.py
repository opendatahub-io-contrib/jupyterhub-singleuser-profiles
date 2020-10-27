import kubernetes
import os
import yaml
import json
import logging
from kubernetes.client import V1EnvVar, V1ResourceRequirements, V1ConfigMap, V1ObjectMeta, V1SecurityContext, V1Capabilities, V1SELinuxOptions
from kubernetes.client.rest import ApiException
from openshift.dynamic import DynamicClient
from .service import Service
from .utils import escape, parse_resources
from .sizes import Sizes
from .images import Images

_LOGGER = logging.getLogger(__name__)

_JUPYTERHUB_USER_NAME_ENV = "JUPYTERHUB_USER_NAME"
_USER_CONFIG_MAP_TEMPLATE = "jupyterhub-singleuser-profile-%s"
_USER_CONFIG_PROFILE_NAME = "@singleuser@"
_GPU_KEY = "nvidia.com/gpu"
_DEFAULT_USER_CM = {
        "env":{"AWS_ACCESS_KEY_ID":"", "AWS_SECRET_ACCESS_KEY":""},
        "gpu":"0",
        "last_selected_image":"",
        "last_selected_size":"",
      }

class SingleuserProfiles(object):
  GPU_MODE_SELINUX = "selinux"
  GPU_MODE_PRIVILEGED = "privileged"
  def __init__(self, namespace=None, verify_ssl=True, gpu_mode=None, service_account_path='/var/run/secrets/kubernetes.io/serviceaccount'):
    self.profiles = []
    self.api_client = None
    self.namespace = namespace #TODO why do I need to pass namespace?
    self.gpu_mode = gpu_mode
    self.oapi_client = None

    if not self.namespace:
      with open(os.path.join(service_account_path, 'namespace')) as fp:
          self.namespace = fp.read().strip()
    kubernetes.config.load_incluster_config()
    self.api_client = kubernetes.client.CoreV1Api()

    configuration = kubernetes.client.Configuration()
    configuration.verify_ssl = verify_ssl
    self.oapi_client = DynamicClient(
      kubernetes.client.ApiClient(configuration=configuration)
    )

    self.service = Service(self.oapi_client, self.namespace)
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

  def get_config_maps_matching_label(self, target_label='jupyterhub=singleuser-profiles'):
    config_maps_list = []
    try:
      config_maps = self.api_client.list_namespaced_config_map(self.namespace, label_selector=target_label)
    except ApiException as e:
      if e.status != 404:
        _LOGGER.error(e)
      return config_maps_list
    for cm in config_maps.items:
      config_maps_list.append(cm.metadata.name)

    _LOGGER.info("Found these additional Config Maps: %s" % config_maps_list)
    return config_maps_list

  def read_config_map(self, config_map_name, key_name="profiles"):
    try:
      config_map = self.api_client.read_namespaced_config_map(config_map_name, self.namespace)
    except ApiException as e:
      if e.status != 404:
        _LOGGER.error(e)
      return {}
      
    config_map_yaml = yaml.load(config_map.data[key_name])
    return config_map_yaml

  def write_config_map(self, config_map_name, key_name, data):
    cm = V1ConfigMap()
    cm.metadata = V1ObjectMeta(name=config_map_name, labels={'app': 'jupyterhub'})
    cm.data = {key_name: yaml.dump(data, default_flow_style=False)}
    try: 
      api_response = self.api_client.replace_namespaced_config_map(config_map_name, self.namespace, cm)
    except ApiException as e:
      if e.status == 404:
        try: 
          api_response = self.api_client.create_namespaced_config_map(self.namespace, cm)
        except ApiException as e:
          _LOGGER.error("Exception when calling CoreV1Api->create_namespaced_config_map: %s\n" % e)
      else:
        raise

  def update_user_profile_cm(self, username, data={}):
    
    user_cm = self.get_user_profile_cm(username)
    cm_name = _USER_CONFIG_MAP_TEMPLATE % escape(username)
    cm_key_name = "profile"
    for key, value in data.items():
      user_cm[key] = value
    self.write_config_map(cm_name, cm_key_name, user_cm)

  def get_user_profile_cm(self, username):
    cm = self.read_config_map(_USER_CONFIG_MAP_TEMPLATE % escape(username), "profile")
    if cm == {}:
      return _DEFAULT_USER_CM
    else:
      return cm
    
  def load_profiles(self, secret_name="jupyter-singleuser-profiles", filename=None, key_name="jupyterhub-singleuser-profiles.yaml", username=None):
    self.profiles = []
    self.sizes = []
    if self.api_client:
      profiles_config_maps = [secret_name]
      profiles_config_maps.extend(sorted(self.get_config_maps_matching_label()))
      for cm_name in profiles_config_maps:
        config_map_yaml = self.read_config_map(cm_name, key_name)
        if config_map_yaml:
          self.sizes.extend(config_map_yaml.get("sizes", [self.empty_profile()]))
          self.profiles.extend(config_map_yaml.get("profiles", [self.empty_profile()]))
        else:
          _LOGGER.error("Could not find config map %s" % cm_name)
      if len(self.profiles) == 0:
        self.profiles.append(self.empty_profile())
      if username:
        config_map_yaml = self.read_config_map(_USER_CONFIG_MAP_TEMPLATE % escape(username), "profile")
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

  def get_images(self):
    i = Images(self.oapi_client, self.namespace)
    return i.get_form(name_only=True)
  
  def get_image_list_form(self, username=None):

    if not self.profiles:
      self.load_profiles(username=username)

    i = Images(self.oapi_client, self.namespace)
    return i.get_form(self.get_profile_by_name(_USER_CONFIG_PROFILE_NAME).get('last_selected_image'))

  @classmethod
  def empty_profile(self):
    return {
      "name": "",
      "users": [],
      "images": [],
      "env": {},
      "node_tolerations": [],
      "node_affinity": {},
      "resources": {
        "requests": {
          "memory": None,
          "cpu": None
        },
        "limits": {
          "memory": None,
          "cpu": None
        },
        "mem_limit": None,
        "cpu_limit": None
      },
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
    profile1["resources"] = {**profile1.get('resources', {}), **profile2.get('resources', {})}
    profile1["services"] = {**profile1.get('services', {}), **profile2.get('services', {})}
    profile1["node_tolerations"] = profile1.get("node_tolerations", []) + profile2.get("node_tolerations", [])
    profile1["node_affinity"] = {**profile1.get('node_affinity', {}), **profile2.get('node_affinity', {})}

    profile1['resources'] = parse_resources(profile1['resources'])

    return profile1

  @classmethod
  def apply_gpu_config(self, gpu_mode, gpu_count, pod):
    if int(gpu_count) > 0:
      pod.spec.containers[0].resources.limits[_GPU_KEY] = str(gpu_count)
      pod.spec.containers[0].resources.requests[_GPU_KEY] = str(gpu_count)

      if gpu_mode:
        if gpu_mode == self.GPU_MODE_SELINUX:
          pod.spec.security_context.capabilities = V1Capabilities(drop=['ALL'])
          pod.spec.security_context.se_linux_options = V1SELinuxOptions(type='nvidia_container_t')

        if gpu_mode == self.GPU_MODE_PRIVILEGED:
          pod.spec.security_context.privileged = True

    return pod

  @classmethod
  def apply_pod_profile(self, spawner, pod, profile):
    api_client = kubernetes.client.ApiClient()

    pod.metadata.labels['jupyterhub.opendatahub.io/user'] = escape(spawner.user.name)

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
      
    if profile.get('node_tolerations'):
        pod.spec.tolerations = profile.get('node_tolerations')

    if profile.get('node_affinity'):
        if not pod.spec.affinity:
            pod.spec.affinity = {}
        pod.spec.affinity['nodeAffinity'] = profile.get('node_affinity')

    for c in pod.spec.containers:
      update = False
      if type(c) is dict:
        env = c['env']
      else:
        env = c.env
      for e in env:
        if type(e) is dict:
          if e['name'] == _JUPYTERHUB_USER_NAME_ENV:
            e['value'] = spawner.user.name
            update = True
            break
        else:
          if e.name == _JUPYTERHUB_USER_NAME_ENV:
            e.value = spawner.user.name
            update = True
            break

      if not update:
        env.append(V1EnvVar(_JUPYTERHUB_USER_NAME_ENV, spawner.user.name))

    self.apply_gpu_config(spawner.gpu_mode, spawner.gpu_count, pod)

    return pod  
