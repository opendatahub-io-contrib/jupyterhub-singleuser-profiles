import kubernetes
import os
import yaml
import logging
from kubernetes.client import V1EnvVar

logger = logging.getLogger(__name__)

class SingleuserProfiles(object):
  def __init__(self):
    self.profiles = {}
    
  def load_profiles(self, secret_name=None, filename=None, key_name="jupyterhub-singleuser-profiles.yaml"):
    load_from_api = True
    if filename and not secret_name:
      load_from_api = False
    if not secret_name:
      secret_name = "jupyter-singleuser-profiles"

    if load_from_api:
      service_account_path = '/var/run/secrets/kubernetes.io/serviceaccount'

      with open(os.path.join(service_account_path, 'namespace')) as fp:
          namespace = fp.read().strip()

      kubernetes.config.load_incluster_config()

      api_client = kubernetes.client.CoreV1Api()

      config_map = api_client.read_namespaced_config_map(secret_name, namespace)
      self.profiles = yaml.load(config_map.data[key_name])["profiles"]
    else:
      with open(filename) as fp:
        data = yaml.load(fp)
        self.profiles = yaml.load(data["data"][key_name])["profiles"]

  def filter_by_username(self, profile, user):
    if not user or not profile.get("users") or "*" in profile.get("users", []):
      return profile
    if user in profile.get("users", []):
      logger.info("Found profile '%s' for user %s" % (profile.get("name"), user))
      return profile
    return {}

  def get_profile_by_image(self, image, user=None):
    for profile in self.profiles:
      if profile.get("images") and len(profile.get("images")) > 0:
        if image in profile.get("images"):
          logger.info("Found profile for image %s" % image)
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
    }

  @classmethod
  def merge_profiles(self, profile1, profile2):
    profile1["name"] =  ", ".join(filter(None, [profile1.get("name", ""), profile2.get("name", "")]))
    profile1["images"] = list(set(profile1.get("images", []) + profile2.get("images", [])))
    profile1["users"] = list(set(profile1.get("users", []) + profile2.get("users", [])))
    profile1["env"] = {**profile1.get('env', {}), **profile2.get('env', {})}
    profile1["resources"] = {**profile1.get('resources', {}), **profile2.get('resources', {})}
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
        logger.info("Setting a memory limit for %s in %s to %s" % (spawner.user.name, spawner.singleuser_image_spec, profile['resources']['mem_limit']))
        pod.spec.containers[0].resources.limits['memory'] = profile['resources']['mem_limit']
      if profile['resources'].get('cpu_limit'):
        logger.info("Setting a cpu limit for %s in %s to %s" % (spawner.user.name, spawner.singleuser_image_spec, profile['resources']['cpu_limit']))
        pod.spec.containers[0].resources.limits['cpu'] = profile['resources']['cpu_limit']
    return pod