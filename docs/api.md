# Spawner API

The new API allows gathering data which is shown in the UI.
The capabilities of the API are:
  - User ConfigMaps (`GET`, `POST`), It is possible to request the json of the User `ConfigMap`, and send a body of data to add (or replace). This includes selections, enviroment variables and gpu number.
  - UI Configuration (`GET`), If UI Configuration is set in a `ConfigMap`, the API is able to return information neccessary to configure the visual style and various elements of the UI. More information about this section can be found [here](./ui_configuration.md)
  - Sizes (`GET`), Sizes can be requested, either as an array of names (used in the UI) or as a pure json body (using the `pure_json=true` query).
  It is also possible to request a single size by name, which returns all information about the specific size.
  - Images (`GET`), Returns a dictionary of all images available to the spawner with all information about each of them. This information includes the description, its human readable name, its URL and optionally its tag specific information, such as dependencies and included software.
  Similar to sizes, it is also possible to request information about a single image as well.

To test the API follow the instructions in the [testing](./testing.md) section of the documentation.

This API is made with [Swagger](https://swagger.io/), and you can find its configuration YAML file [here](../jupyterhub_singleuser_profiles/api/swagger.yaml)

## User Interface

For detailed information about the User Interface component of the JupyterHub Singleuser Profiles please read the [User interface README](../jupyterhub_singleuser_profiles/ui/README.md)