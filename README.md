# JupyterHub Singleuser Profiles

This library helps to manage and configure singleuser JupyterHub servers deployed by KubeSpawner. It allows you to amend environment variables (and potentially other parts of configuration) based on notebook image name and user names.

# Configuration

```
profiles:
  - name: Thoth Notebooks
    images:
    - 's2i-thoth-notebook:3.6'
    users:
    - vpavlin
    - fpokorny
    env:
      THOTH_DEPLOYMENT_NAME: thoth-test-core
      THOTH_CEPH_BUCKET: DH-DEV-DATA
      THOTH_CEPH_BUCKET_PREFIX: data/thoth
      THOTH_JANUSGRAPH_PORT: '80'
    resources:
      mem_limit: 2Gi
      cpu_limit: 1
  - name: globals
    env:
      THIS_IS_GLOBAL: "This will appear in all singleuser pods"
    resources:
      mem_limit: 1Gi
      cpu_limit: 500m
```

* **profiles** is a list of profile objects
* **images** is a list of image names (as used by `singleuser_image_spec` option in KubeSpawner)
* **users** is a list of users allowed to use this profile, to ignore user filtering, specify `"*"` as a user name, or completely omit the `users` section
* **env** is an object containing environment variables to be set for a singleuser server. *Keep in mind that all the values need to be strings - i.e. have quotes numbers!*
* **resources** is an object containing memory and cpu limits (which are then applied to the singleuser pod)

You can omit any section from the configuration. If you remove `images` section, the configration will be matched to all images. If you remove `users` section, it will be matched to all users. This way, you can easily create a globals/default section which will be applied to all users and all images.

# How to Use

The method `load_profiles` can download a given ConfigMap from OpenShift/Kubernetes and extract the configuration from `data` section. This allows for dynamic changes to how (with what environment variables) singleuser servers are deployed - by updating the configuration in the ConfigMap, changes can be automatically pulled on singleuser server (re)start. This approach requires KubeSpawner to be extended - example implementation can be found [here](https://github.com/AICoE/jupyterhub-ocp-oauth/blob/59d09091d725e6bc1349ffb1117d9c4cfaf6ef81/.jupyter/jupyterhub_config.py#L192-L202).

To be able to use `resources` section, you will need to add `c.KubeSpawner.modify_pod_hook` option to your JupyterHub Config and call `SingleuserProfiles.apply_pod_profile(spawner, pod, profile)` from there to get pod manifest updated with the given resource limits.

The profiles library can also read configuration from file - although this feature is more for testing purposes (to not require OpenShift/Kubernetes for developlment), it is possible to use file as a source of configuration in production.

# Use Cases

JupyterHub deployed on OpenShift is not very flexible regarding configuration of particular servers. One use case we are tackling with this library is when a set of users need to have credentials preloaded in their servers to avoid pasting them directly to notebook - think access credentials for object storade.

Obviously anything else you need/can share in environment variables is a good fit - endpoint URLs, team wide configuration etc.

You can imagine different workflows will require different resources - submitting a spark job will not be as resource heavy as running actual analysis on data - for that, you can use combination of `images` and `resources` section to set specific resource quotas for specific image(s).