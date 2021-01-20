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
    volumes:
    - name: dataset
      persistentVolumeClaim:
        claimName: example-dataset-pvc
        readOnly: true
      mountPath: /opt/app-root/src/example-dataset
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
