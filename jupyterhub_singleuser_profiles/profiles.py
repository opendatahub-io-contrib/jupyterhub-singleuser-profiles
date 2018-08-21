import kubernetes
import os
import yaml
import logging
from kubernetes.client import V1EnvVar, V1ConfigMap, V1ObjectMeta
from kubernetes.client.rest import ApiException
from .service import Service
from .utils import escape

_LOGGER = logging.getLogger(__name__)

_JUPYTERHUB_USER_NAME_ENV = "JUPYTERHUB_USER_NAME"
_USER_CONFIG_MAP_TEMPLATE="jupyterhub-singleuser-profile-%s"

class SingleuserProfiles(object):
  def __init__(self, server_url, token, namespace=None, verify_ssl=True):
    self.profiles = []
    self.service = Service(server_url, token, namespace, verify_ssl)
    self.api_client = None
    self.namespace = namespace #TODO why do I need to pass namespace?

    service_account_path = '/var/run/secrets/kubernetes.io/serviceaccount'
    if os.path.exists(service_account_path):
      with open(os.path.join(service_account_path, 'namespace')) as fp:
          self.namespace = fp.read().strip()
      kubernetes.config.load_incluster_config()
      self.api_client = kubernetes.client.CoreV1Api()

  def read_config_map(self, config_map_name, key_name="profiles"):
    try:
      config_map = self.api_client.read_namespaced_config_map(config_map_name, self.namespace)
    except ApiException as e:
      if e.status != 404:
        _LOGGER.error(e)
        print(e)
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

  def update_user_profile_cm(self, username, data):
    self.write_config_map(_USER_CONFIG_MAP_TEMPLATE % escape(username), "profile", {"env": data})

  def get_user_profile_cm(self, username):
    return self.read_config_map(_USER_CONFIG_MAP_TEMPLATE % escape(username), "profile")
    
  def load_profiles(self, secret_name="jupyter-singleuser-profiles", filename=None, key_name="jupyterhub-singleuser-profiles.yaml", username=None):
    self.profiles = []
    if self.api_client:
      config_map_yaml = self.read_config_map(secret_name, key_name)
      if config_map_yaml:
        self.profiles.extend(config_map_yaml.get("profiles", [self.empty_profile()]))
      else:
        print("Could not find config map %s" % config_map_name)
      if len(self.profiles) == 0:
        self.profiles.append(self.empty_profile())
      if username:
        config_map_yaml = self.read_config_map(_USER_CONFIG_MAP_TEMPLATE % escape(username), "profile")
        if config_map_yaml:
          self.profiles.append(config_map_yaml)

      print(self.profiles)
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

  def get_merged_profile(self, image, user=None):
    profile = self.get_profile_by_image(image, user)
    res = self.empty_profile()
    for p in profile:
      res = self.merge_profiles(res, p)

    return res

  def setup_services(self, spawner, image, user):
    profile = self.get_merged_profile(image, user)
    if profile.get("services"):
      for key, service in profile.get("services").items():
        template = self.service.get_template(service["template"])
        resource = self.service.process_template(user, template, **service.get("parameters", {}))
        envs = self.service.submit_resource(resource, service.get("return", {}))
        spawner.environment = {**spawner.environment, **envs}
        spawner.single_user_services.append(resource.get("metadata").get("name"))

  def clean_services(self, spawner, user):
    self.service.delete_resource_by_service_label(user)

  @classmethod
  def empty_profile(self):
    return {
      "name": "",
      "users": [],
      "images": [],
      "env": {},
      "resources": {
        "mem_limit": None,
        "cpu_limit": None
      },
      "services": {}
    }

  @classmethod
  def merge_profiles(self, profile1, profile2):
    profile1["name"] =  ", ".join(filter(None, [profile1.get("name", ""), profile2.get("name", "")]))
    profile1["images"] = list(set(profile1.get("images", []) + profile2.get("images", [])))
    profile1["users"] = list(set(profile1.get("users", []) + profile2.get("users", [])))
    profile1["env"] = {**profile1.get('env', {}), **profile2.get('env', {})}
    profile1["resources"] = {**profile1.get('resources', {}), **profile2.get('resources', {})}
    profile1["services"] = {**profile1.get('services', {}), **profile2.get('services', {})}
    return profile1

  @classmethod
  def apply_pod_profile(self, spawner, pod, profile):
    print(profile)

    if profile.get('env'):
      for k, v in profile['env'].items():
        update = False
        for e in pod.spec.containers[0].env:
          if e.name == k:
            e.value = v
            update = True
            break
        if not update:
          pod.spec.containers[0].env.append(V1EnvVar(k, v))

    if pod.spec.containers[0].resources and profile.get('resources'):
      if profile['resources'].get('mem_limit'):
        _LOGGER.info("Setting a memory limit for %s in %s to %s" % (spawner.user.name, spawner.singleuser_image_spec, profile['resources']['mem_limit']))
        pod.spec.containers[0].resources.limits['memory'] = profile['resources']['mem_limit']
      if profile['resources'].get('cpu_limit'):
        _LOGGER.info("Setting a cpu limit for %s in %s to %s" % (spawner.user.name, spawner.singleuser_image_spec, profile['resources']['cpu_limit']))
        pod.spec.containers[0].resources.limits['cpu'] = profile['resources']['cpu_limit']

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

    return pod  
