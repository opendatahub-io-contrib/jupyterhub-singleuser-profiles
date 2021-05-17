
## Release 0.0.2 (2021-01-05T17:02:05)
### Features
* include thoth.yaml configuration for release maintainence
* setup bot configuration for release
* Modified element accessing
* Fixed dropdown closing
* Rework the package structure; (#59)
* Moved dropdown value check to Dropbtn.js (#60)
* Removed page.html (#64)
* Fixed double ifs (#61)
* UI Definition (#51)
* Changed build source to opendatahub repo (#43)
* Update and lock OpenShift client version (#45)
* API definition (#39)
* Add a pod gpu config handling (#34)
* Use the resource parsing for profiles as well (#35)
* Escape user name to prevent OpenShift rejecting invalid names (#33)
* Added notebook image documentation (#24)
* Add user name to pod labels (#31)
* Make sizes parsing more error proof (#29)
* Implemented image list gathering based on labels (#21)
* Move image list implementation from JupyterHub Config (#17)
* Implemented support for enviroment variable injection (#14)
* Update README for dynamic profile loading from ConfigMaps
* Fix variable vs string issue
* Add support for dynamicallly loading profiles from configmaps
* Change the GPU enablement to support GPU_MODE env var and OCP3 and OCP4
* Use OpenShift v4 compatible api version
* Add GPU configuration to pod spec
* Add (t-shirt) sizes for Jupyter Singleuser containers
* Handle empty dict for data properly
* Enable extension of user config map
* Write user config map
* Load info from users configMap
* Add username as env to every container
* Quote username as it might contain @
* Add proper jsonpath implementation
* Add support for services
* Handle empty config map
* Filter also when image is not defined
* Fix README to reflect the last changes
* Update environment variables in apply_pod_profile method
* Emphasize that globals must be the first profile
* Remove __pycache__
* Add resources to the profile
* Add ability to merge multiple profiles (to support global/default) profile
* Update README to mention asterisk in user list
* Add README and filtering by users
* Add initial implementation
### Bug Fixes
* Do not fail if a service template is not available - just report error and skip the sevice deployment
### Improvements
* Added CSS to size desc
* Fix typo in processed_template logging (#37)
* Clean up error handling for services and refactor new code a bit (#36)
* Generalize how service integration works (#26)
* Implemented kubernetes resource structure to profiles and sizes. (#22)
* Allow customization of notebook node affinity and tolerations
* Fix typo in dict access
### Other
*  Move json loading into API code (#46)

## Release 0.1.0 (2021-01-06T11:03:52)
### Features
* Use template as string rather than yaml

## Release 0.1.1 (2021-01-27T13:50:12)
### Features
* Added volume gathering

## Release 0.1.2 (2021-03-10T11:00:32)
### Features
* Added default image handling and label
* Separated documentation into files
* Added volume gathering

## Release 0.1.3 (2021-03-17T15:48:38)
### Features
* Set the MEM_LIMIT env var to real memory limit
* Force the UI to use https for API calls

## Release 0.2.0 (2021-03-24T10:59:02)
### Features
* Changed how envvars are stored
### Improvements
* Removed debug logs in EnvVarForm
* Rework how env vars and secrets are stored
### Other
* Restructure code for user info rework

## Release 0.2.1 (2021-03-24T16:03:57)
### Features
* Deep copy the default CM to prevent pointer issues

## Release 0.2.2 (2021-03-29T12:36:14)
### Improvements
* Added additional ids in VarForm for selenium tests

## Release 0.2.3 (2021-04-09T18:28:44)
### Features
* Only set gpu if the key exists in profile

## Release 0.2.4 (2021-04-13T17:47:36)
### Features
* Fix the logic around setting default image

## Release 0.3.0 (2021-04-21T17:38:47)
### Features
* Allow getting image detailed info at once
* Forced https calls
* Use the cluster GPU count to set UI limits
* Added generated schemas to swagger
* add gpu number response
* Fix the empty-size UI issue
* Gather image annotation data
* Testing pydantic library
* Added ui_config

## Release 0.3.1 (2021-04-21T20:50:54)
### Features
* Add api prefix to UI andpoint

## Release 0.4.0 (2021-05-17T13:32:36)
### Features
* Add support for custom GPU taints
* Use JUPYTERHUB_LOGIN_URL instead of default and try get user info without cache
* Added a sort function based on label to images
* Disable GPU config by default
* Enable switching custom env variable to a secret
* Fix for hiding sizes correctly based on enabled flags
* Use ui/config for spawner options
* Update UI
* Change apply_gpu_config return value
* Update UI
* Refactor Images
* Remove resources from empty_profile to prevent overriding
* include requirements.txt in manifest.in for source build
### Improvements
* Update image order annotation to match others
