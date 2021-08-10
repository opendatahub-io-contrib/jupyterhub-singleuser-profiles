from .utils import escape
import copy
import logging

_LOGGER = logging.getLogger(__name__)

class User(object):
  _DEFAULT_USER_PRESETS = {
    "gpu":"0",
    "last_selected_image":"",
    "last_selected_size":"",
  }

  _USER_CONFIG_MAP_TEMPLATE = "jupyterhub-singleuser-profile-%s"
  _USER_ENVS_TEMPLATE = "jupyterhub-singleuser-profile-%s-envs"
  _DEFAULT_IMAGE = ""
  _TYPE_SECRET = "password"
  _TYPE_ENV = "text"

  def __init__(self, openshift, default_image, notebook_namespace=None):
      self.openshift = openshift
      self._DEFAULT_IMAGE = default_image
      self.notebook_namespace = notebook_namespace

  # THis method is going to be removed in the future
  def fix_if_legacy(self, username, cm):
    name = self._USER_CONFIG_MAP_TEMPLATE % escape(username)
    if cm and cm.get('env') and type(cm.get('env')) is dict:
      _LOGGER.warn("Found old user presets format. Updating old CM version for user: %s" % username)
      cm['env'] = [{"name": key, "value": value} for key, value in cm['env'].items()]
      self.save_envs(username, cm)
      data_presets = self.get_presets_from_data(cm)
      self.openshift.write_config_map(name, data_presets, "profile")
      

    return cm

  def get_secrets_from_data(self, data):
    return dict([(x["name"], x["value"]) for x in data.get("env", [])  if x.get("type", "") == self._TYPE_SECRET ])

  def get_envs_from_data(self, data):
    return dict([(x["name"], x["value"]) for x in data.get("env", [])  if x.get("type", self._TYPE_ENV) == self._TYPE_ENV ])

  def get_presets(self, username):
    presets = self.openshift.read_config_map(self._USER_CONFIG_MAP_TEMPLATE % escape(username), "profile")
    if presets == {}:
      presets = copy.deepcopy(self._DEFAULT_USER_PRESETS)

    presets = self.fix_if_legacy(username, presets)

    return presets

  def get_presets_from_data(self, data):
    tmp_data = copy.deepcopy(data)
    if tmp_data.get('env') or tmp_data.get('env') == []:
      del tmp_data["env"]
    return tmp_data

  def save_presets(self, username, data):
    name = self._USER_CONFIG_MAP_TEMPLATE % escape(username)
    presets_to_update = self.get_presets(username)
    data_presets = self.get_presets_from_data(data)
    for key, value in data_presets.items():
      presets_to_update[key] = value
    self.openshift.write_config_map(name, presets_to_update, "profile")

  def save_envs(self, username, data):
    name = self._USER_ENVS_TEMPLATE % escape(username)
    self.openshift.write_config_map(name, self.get_envs_from_data(data), notebook_namespace=self.notebook_namespace)

  def get_envs(self, username, for_k8s=False):
    result = []
    name = self._USER_ENVS_TEMPLATE % escape(username)
    data = self.openshift.read_config_map(name, notebook_namespace=self.notebook_namespace)
    if data:
      result = [{"name": key, "type": self._TYPE_ENV, "value": value} for key, value in data.items()]

    if for_k8s:
      result = self.openshift.create_pod_mapping(name, result)

    return result

  def save_secrets(self, username, data):
    name = self._USER_ENVS_TEMPLATE % escape(username)
    self.openshift.write_secret(name, self.get_secrets_from_data(data), notebook_namespace=self.notebook_namespace)

  def get_secrets(self, username, for_k8s=False):
    result = []
    name = self._USER_ENVS_TEMPLATE % escape(username)
    data = self.openshift.read_secret(name, notebook_namespace=self.notebook_namespace)
    if data:
      result = [{"name": key, "type": self._TYPE_SECRET, "value": value} for key, value in data.items()]

    if for_k8s:
      result = self.openshift.create_pod_mapping(name, result, secret=True)

    return result

  def update(self, username, data={}):
    if data.get('env') or data.get('env') == []:
      self.save_envs(username, data)
      self.save_secrets(username, data)
    self.save_presets(username, data)

  def get(self, username, for_k8s=False):
    presets = self.get_presets(username)

    cm_env = self.get_envs(username, for_k8s=for_k8s)
    secret_env = self.get_secrets(username, for_k8s=for_k8s)

    presets['env'] = cm_env + secret_env

    if not presets.get('last_selected_image'):
      presets['last_selected_image'] = self._DEFAULT_IMAGE

    return presets
