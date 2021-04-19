# Configuring the UI

The admin has the ability to configure most parts of the UI to some extent.

The Ui configuration section has this structure by default:

```
ui:
    gpuConfig:
        type: dropdown
        gpuDropdown:
            start: 1
            end: 10
    imageConfig:
        blacklist: [unavailable_image1:v0.1, unavailable_image2:v0.2]
        sort: 'name'
    sizeConfig:
        enabled: false
    envVarConfig:
        enabled: true
        categories:
        - name: Amazon S3
          variables:
          - name:  AWS_ACCESS_KEY_ID
            type: password
          - name:  AWS_SECRET_ACCESS_Key
            type: password
        
```

## Example

The information contained in the ui configuration section is available through the API. If for example, your users did not need the GPU section of the spawner, you can disable it with:
```
    gpuConfig:
        enabled: false
```
Similarly, if you wanted to make certain images, (ex. minimal-notebook:v0.1 and spark-notebook:v0.0.4) unavailable to users, it is possible to blacklist these images with:
```
    imageConfig:
        blacklist: [minimal-notebook:v0.1, spark-notebook:v0.0.4]
```
## Features

Currently the ui configuration section is able to expose the following information through the API:

- Images
    - Black/White listing the images (i.e. ODH deploys all imagestreams and admin can influence what is visible)
    ```
    whitelist: {[image1, image2, ...]}
    blacklist: {[image1, image2, ...]}
    ```
    - Sorting of the images (by name, version
    ```
    sort: {'name' || 'version'}
    ```
- Sizes
    - enable/disable 
    ```
    enabled: {true || false}
    ```
- Gpu
    - enable/disable 
    ```
    enabled: {true || false}
    ```
    - Change visual style to either:
        - Dropdown (With a set range of values) 
        ```
        type: dropdown
        gpuDropdown:
            range:
                start: {int}
                end: {int}
        ```
        - Checkbox (With a set number) 
        ```
        type: checkbox
            gpuCheckbox:
                value: {int}
        ```
        - Input (with a set limit)
        ```
        type: input
            gpuInput:
                limit: {int}
        ```          
- Env Vars
    - enable/disable 
    ```
    enabled: {true || false}
    ```
    - A list of environment variables for "frequently used" environment variable dropdown. (Type can be omitted, in which case it defaults to text)
    ```
    categories:
    - name: {string}
      variables:
      - name: {string}
        type: {"password" || "text"}
      - name: {string}
        type: {"password" || "text"}
    ```
