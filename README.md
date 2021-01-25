# JupyterHub Singleuser Profiles

This library helps to manage and configure singleuser JupyterHub servers deployed by KubeSpawner. It allows you to amend environment variables (and potentially other parts of configuration) based on notebook image name and user names.

# Sections

The `ConfigMap` this library reads is divided into several sections, each configuring a different part of the singleuser server.

- [Services](./docs/services.md)
- [Sizes](./docs/sizes.md)
- [Volumes](./docs/volumes.md)
- [Images](./docs/images.md)
- [API/UI](./docs/api.md)
- [Example Configuration](./docs/configuration.md)
- [How To Use](./docs/howtouse.md)
