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
        resources:
        - name: spark-cluster-template
          path: sparkClusterTemplate
        configuration:
          worker_instances: 1
          worker_memory_limit: 4Gi
          master_memory_limit: 1Gi
        labels:
          opendatahub.io/component: jupyterhub
        return:
          SPARK_CLUSTER: 'metadata.name'
      airflow:
        resources:
        - name: jupyter-services-template
          path: airflowCluster
        - name: jupyter-services-template
          path: airflowBase
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

* **resources** - these are the names of configMaps which contain various templates. For each resource there can be a different configMap with a different path. Or we can use a single configMap containing all templates and these are simply taken by using the correct path.
* **configuration** - an object containing key-value pairs to be processed into the template
* **labels** - object containing labels that will be added into the template
* **return** - an object containing key-value pairs where value is a [JSON Path](https://github.com/kennknowles/python-jsonpath-rw) walkable in the uploaded ConfigMap/CustomResource and key is a name of environment variable under which the value will be available in Jupyterhub Singleuser server

A `USERNAME` parameter is automatically added based on user's name to separate services by user.

As long as the resource is correctly defined in the template and there is a custom resource definition on the cluster, the template can be used to create any custom resource, or a configMap.

The following example shows a ConfigMap containing `sparkClusterTemplate` object which can be used as a `path` reference in the `service` definition.
```
kind: ConfigMap
apiVersion: v1
metadata:
  name: spark-cluster-template
data:
  sparkClusterTemplate: |
    kind: SparkCluster
    apiVersion: radanalytics.io/v1
    metadata:
      name: spark-cluster-{{ user }}
    spec:
      worker:
        instances: "{{ worker_instances }}"
        memoryLimit: "{{ worker_memory_limit }}"
      master:
        memoryLimit: "{{ master_memory_limit }}"

```
The parameters get filled with values in the `configuration` object and a new custom resource is submited to OpenShift, creating a spark cluster. Any labels are added as well.
```
apiVersion: radanalytics.io/v1
kind: SparkCluster
metadata:
  labels:
    opendatahub.io/component: jupyterhub
  name: spark-cluster-[USERNAME]
spec:
  worker:
    instances: "1"
    memoryLimit: "4Gi"
  master:
    memoryLimit: "1Gi"
```  

## Sizes

Similarly to what we are used to from cloud providers and platforms like Open Stack, we want to be able to choose from a list of predefined sizes for our Jupyter notebook container. The `sizes` section allows you to define a list of these sizes which a user can choose from. A `Default` size is listed as well which automatically derives the resource limits from a user profile.

## Notebook images

This project allows JupyterHub to provide a list of images suitable to be run as a singleuser notebook server. Each image can provide different set of preinstalled dependencies and be bound to a different profile - thus use different configuration and compute resources.

The list of images is presented to user in a dropdown list in the spawner UI.

Images are loaded from OpenShift `ImageStream` resource based on label
```opendatahub.io/notebook-image: true```

You can list images in your cluster by running
```oc get imagestreams -l "opendatahub.io/notebook-image=true"```

To add images to the list, simply create `ImageStream` using the above mentioned label

## Spawner API

We are reworking the HTML spawner document to a dynamic spawner page with an API and rendered UI.
The new API allows gathering data which is shown in the UI.
The capabilities of the API are:
  - User ConfigMaps (`GET`, `POST`), It is possible to request the json of the User ConfigMap, and send a body of data to add (or replace). This includes selections, enviroment variables and gpu number.
  - Sizes (`GET`), Sizes can be requested, either as an array of names (used in the UI) or as a pure json body (using the `pure_json=true` query)
  - Images (`GET`), Returns an array of images (which have the proper tag). Note: Due to some limitation it is not possible to gather a json with all of the image information

For testing:
  - To deploy on your cluster use:
   ```oc apply -f openshift```
  - Wait for `api-build` to finish (or start a new one) using
   ```oc get builds```
  - If `api-deploy` is running you can access the api by using 
   ```oc get route jh-api-route -o jsonpath='http://{.spec.host}/ui'```

## User Interface

For detailed information about the User Interface component of the JupyterHub Singleuser Profiles please read the [User interface README](ui/README.md)

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

You can imagine different workflows will require different resources - submitting a Spark job will not be as resource heavy as running actual analysis on data - for that, you can use combination of `images` and `resources` section to set specific resource quotas for specific image(s).
