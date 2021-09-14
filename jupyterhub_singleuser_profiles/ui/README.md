# Jupyterhub SingleUser Profiles User Interface

This part of the JSP repository contains the user interface for configuring the notebook to be spawned.
It contains the javascript and CSS files which are then built as part of the JupyterHub image and the resulting file is ran as a JupyterHub service through the `jupyter_config.py` in the [jupyterhub-odh repository](https://github.com/opendatahub-io/jupyterhub-odh).

## Usage

![Main_UI_img](https://github.com/mroman-redhat/jupyterhub-singleuser-profiles/blob/feature/API/ui/readme_img/UI-main.png)

### JupyterHub Notebook Image
This dropdown contains images available to the logged in user.
By default, to add images to this dropdown you need to add them to your cluster and give their corresponding imagestreams a `opendatahub.io/notebook-image=true` label.

For more information on this process see the JSP [Image documentation](../../docs/images.md)
### Container Size
The container size dropdown contains all of the sizes available to the user.
Currently, these sizes are not tied to the image in use.

The actual limits and requests can be set in the `jupyterhub-singleuser-profiles` Config Map.

For more information, check the JSP [Sizes documentation](../../docs/sizes.md)

By hovering onto any size option, a brief summary will be shown, containing the limits, requests and the name of the size.
### Number of required GPUs
In this field, it is possible to set the amount of required GPUs. Currently it is not possible to specify which GPUs are chosen, just the amount.
### Environment Variables
These fields are divided into variable names and variable values
It is possible to click a dropdown on the side of the variable name which contains frequently used variables. Currently only the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` keys are featured in the dropdown. 

The value field contains the value assigned to the variable. If the variable name is considered secret the value is automatically hidden.

Please note that **currently only the two AWS variables mentioned are considered secret**.
Under each pair of variable name and value is a `Remove` button, which removes the pair.
At the end of the Environment Variables form is an `Add` button which adds a pair to the form.
The amount of environment variables that can be added is unlimited.

Once done with the configuration, it is possible to click the `Start` button to start the notebook.

## Notes

This part of the repository can NOT be run locally. It requires a cluster with Jupyterhub Singleuser Profiles running on it. To access it it is neccessary to go to the JupyterHub spawner page.

The UI is supported by a swagger API to which all of the requests are routed. For more information check the [API section of the documentation](../../docs/api.md)

This UI was boostrapped with [Create React App](https://github.com/facebook/create-react-app). Due to the nature of the UI it is not possible to execute all of the commands mentioned in the instructions.

## Testing

The UI is deployed together with Jupyterhub Singleuser Profiles. To test it it is only necessary to deploy jupyterhub singleuser profiles and open the spawner page.

Similarly, to test changes, it is neccessary to:
1. change the needed CSS or JS files
2. push the changes to a repository
3. rewrite the target repository in the `jupyterhub-img` build
4. start the build and redeploy the pods. 