import connexion
import os
import sys
import json
import logging
from jupyterhub_singleuser_profiles.profiles import SingleuserProfiles
from jupyterhub_singleuser_profiles import version as singleuser_profiles_version

from functools import wraps
from urllib.parse import quote

from flask import Flask
from flask import redirect
from flask import request
from flask import Response

from jupyterhub.services.auth import HubAuth

_PROFILES = SingleuserProfiles(verify_ssl=False)
_PROFILES.load_profiles()

_LOGGER = logging.getLogger(__name__)

prefix = os.environ.get('JUPYTERHUB_SERVICE_PREFIX', '/')

auth = HubAuth(api_token=os.environ['JUPYTERHUB_API_TOKEN'], cache_max_age=60)

app = Flask(__name__)

def authenticated(f):
    """Decorator for authenticating with the Hub"""

    @wraps(f)
    def decorated(*args, **kwargs):
        cookie = request.cookies.get(auth.cookie_name)
        token = request.headers.get(auth.auth_header_name)
        for_user = connexion.request.headers.get('For-User')
        if cookie:
            user = auth.user_for_cookie(cookie, use_cache=True)
            if not user:
                user = auth.user_for_cookie(cookie, use_cache=False)
        elif token:
            user = auth.user_for_token(token, use_cache=True)
            if not user:
                user = auth.user_for_token(token, use_cache=False)
        else:
            user = None
        if for_user and user.get('admin'):
            user['name'] = for_user
            user['admin'] = False
        if user:
            return f(user=user, *args, **kwargs)
        else:
            # redirect to login url on failed auth
            login_url = None #os.environ.get('JUPYTERHUB_LOGIN_URL')
            if not login_url:
                login_url = auth.login_url
            return redirect(login_url + '?next=%s' % quote(request.path))

    return decorated

@app.before_request
def before_request():
    if request.is_secure:
        return

    url = request.url.replace("http://", "https://", 1)
    code = 301
    return redirect(url, code=code)

@authenticated
def whoami(user):
    return Response(
        json.dumps(user, indent=1, sort_keys=True), mimetype='application/json'
    )

@authenticated
def get_user_cm(user):
    cm = _PROFILES.user.get(user['name'])
    return cm

@authenticated
def get_ui_config(user):
    _PROFILES.load_profiles()
    cm = _PROFILES.get_ui_configuration()
    return cm

@authenticated
def update_user_cm(user, body): 
    _PROFILES.user.update(user['name'], data=body)
    return _PROFILES.user.get(user['name'])

@authenticated
def get_sizes(pure_json=False, *args, **kwargs):
    _PROFILES.load_profiles()
    sizes_json = _PROFILES.get_sizes()
    if pure_json:
        return sizes_json
    response = []
    for size in sizes_json:
        response.append(size['name'])
    return response

@authenticated
def get_images(*args, **kwargs):
    _PROFILES.load_profiles()
    images = _PROFILES.images.get()
    return images

@authenticated
def get_image_info(image_name, *args, **kwargs):
    return _PROFILES.get_image_info(image_name)

@authenticated
def get_default_image(*args, **kwargs):
    _PROFILES.load_profiles()
    default_image = _PROFILES.images.get_default()
    return default_image

@authenticated
def get_size_by_name(size_name, *args, **kwargs):
    _PROFILES.load_profiles()
    return _PROFILES.get_size(size_name)

app = connexion.App(__name__, specification_dir='.', options={'swagger_ui':True})
app.add_api('swagger.yaml')

def main():
    app.run(port=8181)
