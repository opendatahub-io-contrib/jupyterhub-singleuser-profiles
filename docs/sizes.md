# Sizes

Similarly to what we are used to from cloud providers and platforms like Open Stack, we want to be able to choose from a list of predefined sizes for our Jupyter notebook container. The `sizes` section allows you to define a list of these sizes which a user can choose from. A `Default` size is listed as well which automatically derives the resource limits from a user profile.

```
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
