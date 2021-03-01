# Volumes

In cases where multiple volumes are neccessary for your Jupyter notebook such as:
- a set of users want to have access to a shared volume
- a workshop requires some dataset/examples and instead of pulling it from S3, you want to have it mounted in the container
- you want to provide additional storage to a set of users
- specialized binaries/libraries mounted into the container

it is possible to define volumes to be added to the notebook.

To choose which volumes get added to the jupyter notebook it is possible to define them in the `ConfigMap` in the `volumes` section. To define a volume a structure similar to the [Kubernetes volume definition structure](https://kubernetes.io/docs/concepts/storage/volumes/) is used.

**Please note that only RWX (Read-Write-Many) volumes are supported**

```
volumes:
  - name: dataset
    persistentVolumeClaim:
      claimName: example-dataset-pvc
      readOnly: true
    mountPath: /opt/app-root/src/example-dataset
```
The `claimName` should include the name of an existing `PersistentVolumeClaim`

`readOnly` sets whether the volume content can be modified

`mountPath` can be set as:
- absolute path: `/opt/app-root/src/example-dataset`
- relative path: `./example-dataset`
- or left empty, in which case it is set to: `{default_mount_path}/{volume_name}`

## Volume sharing

In the current version of Jupyterhub Singleuser Profiles, volumes that are defined in the JSP `ConfigMap` are available based on how they are separated, similar to services, environment variables and so on. In the [Example Configuration](./configuration.md), the volume `example-dataset` would be available to all users, since it is in the `globals` section.