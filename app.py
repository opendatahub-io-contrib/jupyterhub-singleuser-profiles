import connexion
import os
import json
from jupyterhub_singleuser_profiles.profiles import SingleuserProfiles

_PROFILES = SingleuserProfiles(verify_ssl=False)
_PROFILES.load_profiles()

def index():
    with open('./ui/build/index.html', 'r') as f:
        page = f.read()
    return page

def handle_local_file(path):
    with open('./ui/' + path, 'r') as f:
        page = f.read()
    return page

def handle_js(path):
    with open('./ui/build/static/js/' + path) as f:
        page = f.read()
    return page

def handle_css(path):
    with open('./ui/build/static/css/' + path) as f:
        page = f.read()
    return page

def get_user_cm(user):
    cm = _PROFILES.get_user_profile_cm(user)
    return cm

def update_user_cm(user, body): 
    data = json.loads(body)
    _PROFILES.update_user_profile_cm(user, data=data)
    return _PROFILES.get_user_profile_cm(user)

def get_sizes(pure_json=False):
    _PROFILES.load_profiles()
    sizes_json = _PROFILES.get_sizes()
    if pure_json:
        return sizes_json
    response = []
    for size in sizes_json:
        response.append(size['name'])
    return response

def get_images():
    _PROFILES.load_profiles()
    image_array = _PROFILES.get_images()
    return image_array

def get_size_by_name(sizeName):
    _PROFILES.load_profiles()
    return _PROFILES.get_size(sizeName)

app = connexion.App(__name__, specification_dir='.', server='tornado', options={'swagger_ui':True})
app.add_api('swagger.yaml')
app.run(port=8080)
