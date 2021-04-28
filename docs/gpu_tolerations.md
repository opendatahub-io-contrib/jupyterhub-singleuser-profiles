# GPU Tolerations

Nodes containing GPUs often have taints on them so that only workloads requiring GPUs are scheduled onto them. Admins can configure tolerations for different types of GPUs by using the `gpu` section.

The bulk of the logic for the toleration application can be found in `apply_gpu_config` in `profiles.py`. The key parameters here are `gpuTolerations` and `gpuType`. gpuTolerations is populated from the `gpu` section of the singleuser profile configmap. `gpuType` defaults to "ALL". This was done as the JupyterHub notebook spawner UI does not allow users to select the type of GPU they want their pod to be able to use. to get around this, we are currently applying _all_ possible tolerations. Once we are able to select the gpu type, <https://github.com/opendatahub-io/jupyterhub-odh/blob/master/.jupyter/jupyterhub_config.py#L247> will need to be modified to pass the specific GPU that we want to the function.

More information about taints and tolerations can be found in the [Kubernetes Documentation](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration).

```yaml
gpuTypes:
- type: gpu_one
  node_tolerations:
  - key: gpu_one_taint
    operator: Equal
    value: label_target_value
    effect: NoSchedule
- type: gpu_two
  node_tolerations:
  - key: gpu_two_taint
    operator: Equal
    value: label_target_value
    effect: NoSchedule
```
