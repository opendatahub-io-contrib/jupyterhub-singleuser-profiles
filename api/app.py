import connexion
import os
import json
import logging
from jupyterhub_singleuser_profiles.profiles import SingleuserProfiles
from jupyterhub.services.auth import HubAuthenticated, HubAuth
from tornado import web

_PROFILES = SingleuserProfiles(verify_ssl=False)
_PROFILES.load_profiles()
_PATH = "/opt/app-root/lib64/python3.6/site-packages"

_LOGGER = logging.getLogger(__name__)

class Handler(HubAuthenticated, web.RequestHandler):
    hub_users={'mroman','vpavlin'}


    def initialize(self, hub_auth):
        self.hub_auth = hub_auth
        #self.current_user = self.get_current_user()

    @web.authenticated
    def get_user_cm(self, user):
        if self.get_current_user() == user:
            cm = _PROFILES.get_user_profile_cm(user)
            return cm
        else:
            _LOGGER.error("Username not authenticated %s %s" % (user, self.get_current_user()))

    @web.authenticated
    def update_user_cm(self, user, body): 
        _PROFILES.update_user_profile_cm(user, data=body)
        return _PROFILES.get_user_profile_cm(user)

    @web.authenticated
    def get_sizes(self, pure_json=False):
        _PROFILES.load_profiles()
        sizes_json = _PROFILES.get_sizes()
        if pure_json:
            return sizes_json
        response = []
        for size in sizes_json:
            response.append(size['name'])
        return response

    @web.authenticated
    def get_images(self):
        _PROFILES.load_profiles()
        image_array = _PROFILES.get_images()
        return image_array

    @web.authenticated
    def get_size_by_name(self, size_name):
        _PROFILES.load_profiles()
        return _PROFILES.get_size(size_name)

_HANDLER = Handler()
hub_auth = HubAuth()
hub_auth.api_token = os.environ.get('JUPYTERHUB_API_TOKEN')
_HANDLER.initialize(hub_auth)

def get_user_cm(user):
    _HANDLER.get_user_cm(user)

def update_user_cm(user, body):
    _HANDLER.update_user_cm(user, body)

def get_sizes(pure_json=False):
    _HANDLER.get_sizes(pure_json)

def get_images():
    _HANDLER.get_images()

def get_size_by_name(size_name):
    _HANDLER.get_size_by_name(size_name)

app = connexion.App(__name__, specification_dir='.', server='tornado', options={'swagger_ui':True})
app.add_api('swagger.yaml')
app.run(port=8181)
