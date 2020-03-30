# JupyterHub Singleuser Profiles

This library helps to manage and configure singleuser JupyterHub servers deployed by KubeSpawner. It allows you to amend environment variables (and potentially other parts of configuration) based on notebook image name and user names.

# Configuration

``` profiles:
  - name: globals
    env:
    - name: THIS_IS_GLOBAL
      value: "This will appear in all singleuser pods"
    - name: MYAPP_SECRET_TOKEN
      valueFrom:
        secretKeyRef:
          key: SECRET_TOKEN
          name: testing-secret-token
    - name: MY_CONFIGMAP_VALUE
      valueFrom:
        configMapKeyRef:
          name: myconfigmap
          key: mykey
    resources:
      requests:
        memory: "500Mi"
        cpu: "250m"
      limits:
        memory: "1Gi"
        cpu: "500m"
  - name: Special Nodes
    users:
    - acorvin
    # Set OpenShift node tolerations for a notebook pod. See https://kubernetes.io/docs/concepts/configuration/taint-and-toleration/ for more information.
    node_tolerations:
      - key: some_node_label
        operator: Equal
        value: label_target_value
        effect: NoSchedule
    # Set OpenShift node affinity for a notebook pod. See https://kubernetes.io/docs/concepts/configuration/assign-pod-node/ for more information.
    node_affinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions:
            - key: some_node_label
              operator: In
              values:
              - label_target_value_1
              - label_target_value_2
  - name: Thoth Notebooks
    images:
    - 's2i-thoth-notebook:3.6'
    users:
    - vpavlin
    - fpokorny
    env:
    - name: THOTH_DEPLOYMENT_NAME
      value: thoth-test-core
    - name: THOTH_CEPH_BUCKET
      value: DH-DEV-DATA
    - name: THOTH_CEPH_BUCKET_PREFIX
      value: data/thoth
    - name: THOTH_JANUSGRAPH_PORT
      value: '80'
    resources:
      requests:
        memory: "1Gi"
        cpu: "500m"
      limits:
        memory: "2Gi"
        cpu: "1"
  - name: Spark Notebook
    images:
    - 's2i-spark-notebook:3.6'
    services:
      spark:
        template: jupyterhub-spark-operator-configmap
        parameters:
          WORKER_NODES: 2
          MASTER_NODES: 1
          MEMORY: 2Gi
          CPU: 2
          SPARK_IMAGE: jkremser/openshift-spark:2.3-latest
        return:
          SPARK_CLUSTER: "metadata.name"
sizes:
  - name: Small
    resources:
      requests:
        memory: "1Gi"
        cpu: "1"
      limits:
        memory: "2Gi"
        cpu: "2"
  - name: Medium
    resources:
      requests:
        memory: "2Gi"
        cpu: "2"
      limits:
        memory: "4Gi"
        cpu: "4"
  - name: Large
    resources:
      requests:
        memory: "4Gi"
        cpu: "4"
      limits:
        memory: "8Gi"
        cpu: "8"
```

* **profiles** is a list of profile objects
* **images** is a list of image names (as used by `singleuser_image_spec` option in KubeSpawner)
* **users** is a list of users allowed to use this profile, to ignore user filtering, specify `"*"` as a user name, or completely omit the `users` section
* **env** env is a list containing environment variables to be set for a singleuser server. It follows the structure defined by Kubernetes for environment variables in containers by [value](https://kubernetes.io/docs/tasks/inject-data-application/define-environment-variable-container/) and [by reference](https://kubernetes.io/docs/concepts/configuration/secret/#using-secrets-as-environment-variables)
* **node_tolerations** is a list of OpenShift node tolerations to be applied to the singleuser pod. See https://kubernetes.io/docs/concepts/configuration/taint-and-toleration/ for more information.
* **node_affinity** is an object containing node affinity definitions to be applied to the singleuser pod. See https://kubernetes.io/docs/concepts/configuration/assign-pod-node/ for more information.
* **resources** is an object containing the memory and cpu requests and limits. Based on kubernetes structure. See: https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/ (which are then applied to the singleuser pod)
* **services** is an object of objects describing services which should be run with the Jupyter Single User Server. See details below

You can omit any section from the configuration. If you remove `images` section, the configuration will be matched to all images. If you remove `users` section, it will be matched to all users. This way, you can easily create a globals/default section which will be applied to all users and all images. Do not forget to put `globals first` in the list, otherwise defaults will overwrite other configuration - there is no magic, values from the last matched profile in the list will get applied.

## Services

Sometimes you need a service to be available alongside your Jupyter server. In this example such service would be Spark ephemeral cluster - that means a cluster living only as long as the user's JupyterHub single user server lives.

A service is described by 

* **template** - a name of a template imported in OpenShift which describes how to deploy the service
* **parameters** - an object containing key-value pairs to be processed into the template
* **return** - an object containing key-value pairs where value is a [JSON Path](https://github.com/kennknowles/python-jsonpath-rw) walkable in the uploaded ConfigMap/CustomResource and key is a name of environment variable under which the value will be available in Jupyterhub Singleuser server

A `USERNAME` parameter is automatically added based on user's name to separate services by user.

```
template: jupyterhub-spark-operator-configmap
parameters:
  WORKER_NODES: 2
  MASTER_NODES: 1
  MEMORY: 2Gi
  CPU: 2
  SPARK_IMAGE: jkremser/openshift-spark:2.3-latest
return:
  SPARK_CLUSTER: "metadata.name"
```

With this Spark example we rely on the Spark Operator which only requires a ConfigMap to be pushed to OpenShift to configure and spawn new cluster. That said, JuypterHub Singleuser Profiles would find the ConfigMap template based on the `template` field, ask OpenShift to process it with given `parameters` and then upload it to OpenShift which would result in a new Spark cluster to be created.

## Sizes

Similarly to what we are used to from cloud providers and platforms like Open Stack, we want to be able to choose from a list of predefined sizes for our Jupyter notebook container. The `sizes` section allows you to define a list of these sizes which a user can choose from. A `Default` size is listed as well which automatically derives the resource limits from a user profile.

# How to Use

## ConfigMap Method

The method `load_profiles` can download a given ConfigMap from OpenShift/Kubernetes and extract the configuration from `data` section. This allows for dynamic changes to how (with what environment variables) singleuser servers are deployed - by updating the configuration in the ConfigMap, changes can be automatically pulled on singleuser server (re)start.

By default, the `load_profiles` method attempts to read profile data from a ConfigMap named "jupyter-singleuser-profiles". In addition, it will also search for any ConfigMap with a label that matches "jupyterhub=singleuser-profiles" and load profile data from a key therein named "jupyterhub-singleuser-profiles.yaml". This allows for dynamic customization of the JupyterHub deployment. These ConfigMaps will be loaded alphabetically, where configuration in later ConfigMaps will override earlier ones.

This approach requires `c.KubeSpawner.modify_pod_hook` option to point to a function similar to [this](https://github.com/AICoE/jupyterhub-ocp-oauth/blob/master/.jupyter/jupyterhub_config.py#L192) - it simply calls out to `SingleuserProfiles.apply_pod_profile` which takes a pod and updates its configuration based on the profile and returns new pod manifest.

## Static File Method

The profiles library can also read configuration from file - although this feature is more for testing purposes (to not require OpenShift/Kubernetes for developlment), it is possible to use file as a source of configuration in production.

# Use Cases

JupyterHub deployed on OpenShift is not very flexible regarding configuration of particular servers. One use case we are tackling with this library is when a set of users need to have credentials preloaded in their servers to avoid pasting them directly to notebook - think access credentials for object storade.

Obviously anything else you need/can share in environment variables is a good fit - endpoint URLs, team wide configuration etc.

You can imagine different workflows will require different resources - submitting a spark job will not be as resource heavy as running actual analysis on data - for that, you can use combination of `images` and `resources` section to set specific resource quotas for specific image(s).
