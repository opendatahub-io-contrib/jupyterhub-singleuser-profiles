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
