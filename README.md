# JupyterHub Singleuser Profiles

This library helps to manage and configure singleuser JupyterHub servers deployed by KubeSpawner. It allows you to amend environment variables (and potentially other parts of configuration) based on notebook image name and user names.

# Configuration

```
profiles:
  - images:
    - 's2i-thoth-notebook:3.6'
    users:
    - vpavlin
    - fpokorny
    env:
      THOTH_DEPLOYMENT_NAME: thoth-test-core
      THOTH_CEPH_BUCKET: DH-DEV-DATA
      THOTH_CEPH_BUCKET_PREFIX: data/thoth
      THOTH_JANUSGRAPH_PORT: '80'
```

* **profiles** is a list of profile objects
* **images** is a list of image names (as used by `singleuser_image_spec` option in KubeSpawner)
* **users** is a list of users allowed to use this profile
* **env** is an object containing environment variables to be set for a singleuser server

# How to Use

The method `load_profiles` can download a given ConfigMap from OpenShift/Kubernetes and extract the configuration from `data` section. This allows for dynamic changes to how (with what environment variables) singleuser servers are deployed - by updating the configuration in the ConfigMap, changes can be automatically pulled on singleuser server (re)start. This approach requires KubeSpawner to be extended - example implementation can be found [here](https://github.com/AICoE/jupyterhub-ocp-oauth/blob/59d09091d725e6bc1349ffb1117d9c4cfaf6ef81/.jupyter/jupyterhub_config.py#L192-L202).

The profiles library can also read configuration from file - although this feature is more for testing purposes (to not require OpenShift/Kubernetes for developlment), it is possible to use file as a source of configuration in production.

# Use Cases

JupyterHub deployed on OpenShift is not very flexible regarding configuration of particular servers. One use case we are tackling with this library is when a set of users need to have credentials preloaded in their servers to avoid pasting them directly to notebook - think access credentials for object storade.

Obviously anything else you need/can share in environment variables is a good fit - endpoint URLs, team wide configuration etc.

There is also a potential to extend and update other configuration than environment variables - for example a set of users might need different amount of resources for their JupyterHub servers. This is not implemented yet.