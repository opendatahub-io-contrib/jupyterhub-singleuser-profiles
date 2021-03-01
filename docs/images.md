# Notebook images

This project allows JupyterHub to provide a list of images suitable to be run as a singleuser notebook server. Each image can provide different set of preinstalled dependencies and be bound to a different profile - thus use different configuration and compute resources.

The list of images is presented to user in a dropdown list in the spawner UI.

Images are loaded from OpenShift `ImageStream` resource based on label
```opendatahub.io/notebook-image: true```

You can list images in your cluster by running
```oc get imagestreams -l "opendatahub.io/notebook-image=true"```

To add images to the list, simply create an `ImageStream` using the above mentioned label

## Custom images
For more information about creating a custom image to use in the UI check the [Adding custom image documentation]()
