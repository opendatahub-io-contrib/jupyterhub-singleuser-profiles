# Testing

## JSP

To test the JupyterHub Singleuser Profiles library, you can follow these steps:

1. Create a fork of the [JSP repository](https://github.com/opendatahub-io/jupyterhub-singleuser-profiles)
2. Apply the required changes.
3. Clone the [jsp-wrapper](https://github.com/vpavlin/jsp-wrapper) repository.
4. Follow the instructions written in the jsp-wrapper [README](https://github.com/vpavlin/jsp-wrapper#readme)
5. Your changes should now be applied to jupyterhub in your cluster.

### Notes:

- In step 4 it is necessary to be logged in to your target openshift cluster, and you must have a quay.io account and be logged in to it through podman.
If your quay.io username is different from your github username, it is changeable with the `QUAY_REPO` variable. (ex. QUAY_REPO=username)
- After step 5 any errors will be logged into the main `jupyterhub` pod.
- To increase the verbosity of logging, each .py file which is part of the JSP library has a `_LOGGER` variable. To set verbosity to maximum, add `_LOGGER.setlevel('DEBUG')`. By default the verbosity is set to `WARNING` and above.

## JSP + Jupyterhub-odh

To test jsp changes hat require modifying the [jupyterhub-odh](https://github.com/opendatahub-io/jupyterhub-odh) repository follow these steps:

1. Create forks of both the [JSP repository](https://github.com/opendatahub-io/jupyterhub-singleuser-profiles) and the [jupyterhub-odh repository](https://github.com/opendatahub-io/jupyterhub-odh)
2. Apply the required changes.
3. Push the changes in the JSP library
4. Modify the `jupyterhub-singleuser-profiles` value in the jupyterhub-odh [Pipfile](https://github.com/opendatahub-io/jupyterhub-odh/blob/master/Pipfile) to ``` {ref = "branch-name",git = "https://github.com/<username>/jupyterhub-singleuser-profiles.git"} ``` where the `git` value should point to your fork
5. Run the `pipenv lock` command. Save all changes and push them to the jupyterhub-odh repo
6. Access the `jupyterhub-img` `BuildConfig` on your cluster. 
7. Look for the `uri` value under `source`, Change it to your fork adress. Then add a `ref` value under `uri`, which will contain the name of your branch.
8. Start the build. When the build finishes, redeploy the jupyterhub pod.

### Notes

- If you are missing the `jupyterhub-img` `BuildConfig`,

## API

To test the API of the JSP library the same steps apply. Following these steps, it is necessary to go to the jupyterhub `route`. To get to the debug UI of the AI use the following link: `<jupyterhub route>/services/api/ui`

Any errors of the API will appear in the main `jupyterhub` pod. To configure these logs follow the instructions in the notes section of the JSP testing manual above.

## UI

To test the Spawner UI, follow the steps in the JSP section above. Then follow the jupyterhub `route`.

Any arrors will appear in the console accessed with F12. Closer information about the error may be available in the `jupyterhub` pod.