import kubernetes
import os
import yaml


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
            return profile
          if user in profile.get("users", []):
            return profile

    return {}

