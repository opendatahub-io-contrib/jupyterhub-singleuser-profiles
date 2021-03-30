# Spawner API

The new API allows gathering data which is shown in the UI.
The capabilities of the API are:
  - User ConfigMaps (`GET`, `POST`), It is possible to request the json of the User ConfigMap, and send a body of data to add (or replace). This includes selections, enviroment variables and gpu number.
  - Sizes (`GET`), Sizes can be requested, either as an array of names (used in the UI) or as a pure json body (using the `pure_json=true` query)
  - Images (`GET`), Returns an array of images (which have the proper tag). Note: Due to some limitation it is not possible to gather a json with all of the image information

For testing:
  - To deploy on your cluster use:
   ```oc apply -f openshift```
  - Wait for `api-build` to finish (or start a new one) using
   ```oc get builds```
  - If `api-deploy` is running you can access the api by using 
   ```oc get route jh-api-route -o jsonpath='http://{.spec.host}/ui'```

This API is made with [Swagger](https://swagger.io/), and you can find its configuration YAML file [here](../jupyterhub_singleuser_profiles/api/swagger.yaml)

## User Interface

For detailed information about the User Interface component of the JupyterHub Singleuser Profiles please read the [User interface README](../jupyterhub_singleuser_profiles/ui/README.md)