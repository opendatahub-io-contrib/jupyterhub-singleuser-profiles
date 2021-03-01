# How to Use

## ConfigMap Method

The method `load_profiles` can download a given ConfigMap from OpenShift/Kubernetes and extract the configuration from `data` section. This allows for dynamic changes to how (with what environment variables) singleuser servers are deployed - by updating the configuration in the ConfigMap, changes can be automatically pulled on singleuser server (re)start.

By default, the `load_profiles` method attempts to read profile data from a ConfigMap named `jupyter-singleuser-profiles`. In addition, it will also search for any ConfigMap with a label that matches `jupyterhub=singleuser-profiles` and load profile data from a key therein named `jupyterhub-singleuser-profiles.yaml`. This allows for dynamic customization of the JupyterHub deployment. These ConfigMaps will be loaded alphabetically, where configuration in later ConfigMaps will override earlier ones.

This approach requires `c.KubeSpawner.modify_pod_hook` option to point to a function similar to [this](https://github.com/opendatahub-io/jupyterhub-odh/blob/master/.jupyter/jupyterhub_config.py#L241) - it simply calls out to `SingleuserProfiles.apply_pod_profile` which takes a pod and updates its configuration based on the profile and returns new pod manifest.

## Static File Method

The profiles library can also read configuration from file - although this feature is more for testing purposes (to not require OpenShift/Kubernetes for developlment), it is possible to use file as a source of configuration in production.

# Use Cases

JupyterHub deployed on OpenShift is not very flexible regarding configuration of particular servers. One use case we are tackling with this library is when a set of users need to have credentials preloaded in their servers to avoid pasting them directly to notebook - think access credentials for object storade.

Obviously anything else you need/can share in environment variables is a good fit - endpoint URLs, team wide configuration etc.

You can imagine different workflows will require different resources - submitting a Spark job will not be as resource heavy as running actual analysis on data - for that, you can use combination of `images` and `resources` section to set specific resource quotas for specific image(s).
