import kubernetes
import os
import yaml
import logging

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

  def get_profile_by_image(self, image, user=None):
    for profile in self.profiles:
      if profile.get("images") and len(profile.get("images")) > 0:
        if image in profile.get("images"):
          if not user or not profile.get("users") or "*" in profile.get("users", []):
            logger.info("Found profile for image %s, not filtering by user" % image)
            yield profile
          if user in profile.get("users", []):
            logger.info("Found profile '%s' for image %s, filtering by user %s" % (profile.get("name"), image, user))
            yield profile
      else:
        yield profile

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
      "env": {}
    }

  @classmethod
  def merge_profiles(self, profile1, profile2):
    profile1["name"] =  ", ".join(filter(None, [profile1.get("name", ""), profile2.get("name", "")]))
    profile1["images"] = list(set(profile1.get("images", []) + profile2.get("images", [])))
    profile1["users"] = list(set(profile1.get("users", []) + profile2.get("users", [])))
    profile1["env"] = {**profile1.get('env', {}), **profile2.get('env', {})}
    return profile1