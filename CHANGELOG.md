
## Release 0.6.4 (2021-10-19T14:25:48)
* Add maroroman to maintainers
* Add millibyte check (#201)
* Add a case for when node memory allocatable is in bytes
* Add admin page (#199)
* Fix to save settings and spawn servers for other users correctly (#198)
* api.py: Add check for initialization user object
* Watch available images, don't enable Start until one is selected (#197)
* Fix how default image is loaded and decided (#195)
* Release of version 0.6.3
* Correct swagger api
* Add error message on incorrect cm
* Hide and un-schedulable sizes from the Size selection (#188)
* Label all sizes to show if they will be schedulable on the cluster (#187)
* Release of version 0.6.2
* Changed build status gathering to prevent issues
* Set notebook namespace to None if it is empty
* Updated docs to reflect changes in jsp-wrapper
* Release of version 0.6.1
* Change custom namespace gathering to allow unset namespace
* Fix to ensure there is an initial image selection (#177)
* Release of version 0.6.0
* [RHODS-1641] Add notebook_namespace parameter for cm and secrets
* Handle image tags with invalid semantic versions (#173)
* Updated annotations and testing
* fix username read issue in frontend API call (#172)
* Release of version 0.5.1
* Use the default tag if there is no prev or default image
* Check for the empty status
* Append tag name to the default image
* Release of version 0.5.0
* Fix to save changes on env variable deletion (#164)
* UI: Indicate notebooks are still being built (#163)
* Handle multiple version of notebooks (#162)
* Skip imagestreams which don't have any tags
* Move buildstatus to ImageTagInfo
* Fix the UI config for GPU number dropdown
* Added recommended tags and changed structure of images
* Add segment key and clusterversion
* Handle config load errors and config loading state
* Added a build_status value for each notebook image
* Add default empty list before loop in tag_exists
* Release of version 0.4.2
* Enable the JUPYTERHUB_LOGIN_URL for login redirect
* Default the display name to imagestream name
* Release of version 0.4.1
* Avoid throwing exception when tag.annotations are not set
* Release of version 0.4.0
* Update image order annotation to match others
* Add support for custom GPU taints
* Use JUPYTERHUB_LOGIN_URL instead of default and try get user info without cache
* Updated the documentation
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
* Release of version 0.3.1
* Add api prefix to UI andpoint
* Release of version 0.3.0
* Allow getting image detailed info at once
* Forced https calls
* Use the cluster GPU count to set UI limits
* Added generated schemas to swagger
* add gpu number response
* Fix the empty-size UI issue
* Release of version 0.2.4
* Gather image annotation data
* Fix the logic around setting default image
* Release of version 0.2.3
* Only set gpu if the key exists in profile
* Testing pydantic library
* Release of version 0.2.2
* Added additional ids in VarForm for selenium tests
* Release of version 0.2.1
* Deep copy the default CM to prevent pointer issues
* Release of version 0.2.0
* Removed debug logs in EnvVarForm
* Rework how env vars and secrets are stored
* Restructure code for user info rework
* Release of version 0.1.3
* Set the MEM_LIMIT env var to real memory limit
* Force the UI to use https for API calls
* Release of version 0.1.2
* Added default image handling and label
* Changed how envvars are stored
* Added ui_config
* Release of version 0.1.1
* Added volume gathering
* Separated documentation into files
* Added volume gathering
* Release of version 0.1.0
* Release of version 0.0.2
* include thoth.yaml configuration for release maintainence
* setup bot configuration for release
* Added CSS to size desc
* Modified element accessing
* Fixed dropdown closing
* Use template as string rather than yaml
* Rework the package structure; (#59)
* Moved dropdown value check to Dropbtn.js (#60)
* Removed page.html (#64)
* Fixed double ifs (#61)
* UI Definition (#51)
* Changed build source to opendatahub repo (#43)
*  Move json loading into API code (#46)
* Update and lock OpenShift client version (#45)
* API definition (#39)
* Fix typo in processed_template logging (#37)
* Add a pod gpu config handling (#34)
* Use the resource parsing for profiles as well (#35)
* Clean up error handling for services and refactor new code a bit (#36)
* Escape user name to prevent OpenShift rejecting invalid names (#33)
* Added notebook image documentation (#24)
* Add user name to pod labels (#31)
* Make sizes parsing more error proof (#29)
* Generalize how service integration works (#26)
* Implemented kubernetes resource structure to profiles and sizes. (#22)
* Implemented image list gathering based on labels (#21)
* Move image list implementation from JupyterHub Config (#17)
* Implemented support for enviroment variable injection (#14)
* Allow customization of notebook node affinity and tolerations
* Update README for dynamic profile loading from ConfigMaps
* Fix variable vs string issue
* Add support for dynamicallly loading profiles from configmaps
* Change the GPU enablement to support GPU_MODE env var and OCP3 and OCP4
* Do not fail if a service template is not available - just report error and skip the sevice deployment
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
* Fix typo in dict access
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

## Release 0.6.3 (2021-09-07T17:03:03)
### Features
* Correct swagger api
* Hide and un-schedulable sizes from the Size selection (#188)
* Label all sizes to show if they will be schedulable on the cluster (#187)
* Updated docs to reflect changes in jsp-wrapper
* Updated the documentation
### Bug Fixes
* Add error message on incorrect cm
### Non-functional
* Updated annotations and testing

## Release 0.6.2 (2021-08-25T14:47:37)
### Features
* Changed build status gathering to prevent issues
* Set notebook namespace to None if it is empty

## Release 0.6.1 (2021-08-19T18:08:48)
### Features
* Change custom namespace gathering to allow unset namespace
* Fix to ensure there is an initial image selection (#177)

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

## Release 0.4.1 (2021-05-27T13:08:54)
### Bug Fixes
* Avoid throwing exception when tag.annotations are not set

## Release 0.4.2 (2021-06-03T13:43:09)
### Features
* Enable the JUPYTERHUB_LOGIN_URL for login redirect
* Default the display name to imagestream name

## Release 0.5.0 (2021-07-08T11:22:03)
### Features
* Fix to save changes on env variable deletion (#164)
* UI: Indicate notebooks are still being built (#163)
* Handle multiple version of notebooks (#162)
* Skip imagestreams which don't have any tags
* Move buildstatus to ImageTagInfo
* Fix the UI config for GPU number dropdown
* Add segment key and clusterversion
* Added a build_status value for each notebook image
* Add default empty list before loop in tag_exists
### Improvements
* Added recommended tags and changed structure of images
* Handle config load errors and config loading state

## Release 0.5.1 (2021-07-13T08:35:31)
### Features
* Use the default tag if there is no prev or default image
* Check for the empty status
* Append tag name to the default image

## Release 0.6.0 (2021-08-12T14:11:59)
### Features
* Handle image tags with invalid semantic versions (#173)
### Bug Fixes
* fix username read issue in frontend API call (#172)
### Improvements
* [RHODS-1641] Add notebook_namespace parameter for cm and secrets
