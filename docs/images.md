# Notebook images

This project allows JupyterHub to provide a list of images suitable to be run as a singleuser notebook server. Each image can provide different set of preinstalled dependencies and be bound to a different profile - thus use different configuration and compute resources.

The list of images is presented to user in a dropdown list in the spawner UI.

Images are loaded from OpenShift `ImageStream` resource based on label
```opendatahub.io/notebook-image: true```

You can list images in your cluster by running
```oc get imagestreams -l "opendatahub.io/notebook-image=true"```

To add images to the list, simply create an `ImageStream` using the above mentioned label

## Custom images
For more information about creating a custom image to use in the UI check the [Adding custom image documentation](http://opendatahub.io/docs/administration/installation-customization/add-custom-image.html)

## Annotations
To provide more information about the image to the user, or sort the images, it is possible to add the following annotations to the image:

- `opendatahub.io/notebook-image-desc`: Image description
- `opendatahub.io/notebook-image-name`: Human readable name
- `opendatahub.io/notebook-image-url`: Url of image
- `opendatahub.io/notebook-image-order`: Sets the order in which images appear within UI, defaults to position number 100
### Tag Specific
- `opendatahub.io/notebook-software`: list of software within notebook
- `opendatahub.io/notebook-python-dependencies`: list of dependencies
- `opendatahub.io/notebook-image-recommended`: Used by UI to pick the right tag if user only selected an image, not image+tag
- `opendatahub.io/default-image`: `bool`, sets whether the image should be used as default in the Spawner UI