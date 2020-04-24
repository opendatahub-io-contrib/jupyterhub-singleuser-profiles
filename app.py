import connexion
import os
from jupyterhub_singleuser_profiles.profiles import SingleuserProfiles

_PROFILES = None

def start_singleuser_profiles():
    global _PROFILES

    server_url = "https://openshift.default.svc.cluster.local"
    service_account_path = '/var/run/secrets/kubernetes.io/serviceaccount'

    with open(os.path.join(service_account_path, 'token')) as fp:
        client_secret = fp.read().strip()

    _PROFILES = SingleuserProfiles(server_url, client_secret, verify_ssl=False)
    _PROFILES.load_profiles()

def hello_world():
    return "Hello World!"

def get_user_cm(user):
    return _PROFILES.get_user_profile_cm(user)

def get_user_profile(user):
    return _PROFILES.get_merged_profile("", user)


app = connexion.App(__name__, specification_dir='.', server='tornado', options={'swagger_ui':True})
app.add_api('swagger.yaml')
start_singleuser_profiles()
app.run(port=8080)