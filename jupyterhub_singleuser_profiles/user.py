from .utils import escape

class User(object):
  _DEFAULT_USER_SECRET = {
      "env":[],
    }

  _DEFAULT_USER_CM = {
    "env":[],
    "gpu":"0",
    "last_selected_image":"",
    "last_selected_size":"",
  }

  _USER_CONFIG_MAP_TEMPLATE = "jupyterhub-singleuser-profile-%s"
  _DEFAULT_IMAGE = ""

  def __init__(self, openshift, default_image):
      self.openshift = openshift
      self._DEFAULT_IMAGE = default_image

  def fix_legacy_user_cm(self, cm):
    env_list = []
    for key, value in cm['env'].items():
      env_list.append({"name":key, "type":"text", "value":value})
    cm['env'] = env_list
    return cm


  def update(self, username, data={}):
    user_cm = self.get_configmap(username)
    user_cm_env = []
    user_secret = self.get_secret(username)
    user_secret['env'] = []
    resource_name = self._USER_CONFIG_MAP_TEMPLATE % escape(username)
    cm_key_name = "profile"
    for key, value in data.items():
      user_cm[key] = value
    for var in user_cm['env']:
      if var['type'] == "password":
        user_secret['env'].append(var)
      else:
        user_cm_env.append(var)
    user_cm['env'] = user_cm_env
    self.openshift.write_secret(resource_name, cm_key_name, user_secret)
    self.openshift.write_config_map(resource_name, cm_key_name, user_cm)

  def get_configmap(self, username):
    cm = self.openshift.read_config_map(self._USER_CONFIG_MAP_TEMPLATE % escape(username), "profile")
    if cm == {}:
      cm = self._DEFAULT_USER_CM
    if isinstance(cm['env'], dict):
      cm = self.fix_legacy_user_cm(cm)

    if cm['last_selected_image'] == '':
      cm['last_selected_image'] = self._DEFAULT_IMAGE
    return cm

  def get_secret(self, username):
    secret = self.openshift.read_secret(self._USER_CONFIG_MAP_TEMPLATE % escape(username))
    if secret == {}:
      secret = self._DEFAULT_USER_SECRET

    return secret

  def get(self, username, for_k8s=False):
    cm = self.get_configmap(username)
    secret = self.get_secret(username)

    for sec in secret['env']:
      cm['env'].append(sec)
    if for_k8s:
      for x in cm['env']:
        del x['type']

    return cm
