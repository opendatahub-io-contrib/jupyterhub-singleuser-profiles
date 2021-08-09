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

To test jsp changes that require modifying the [jupyterhub-odh](https://github.com/opendatahub-io/jupyterhub-odh) repository follow these steps:

1. Create forks of both the [JSP repository](https://github.com/opendatahub-io/jupyterhub-singleuser-profiles) and the [jupyterhub-odh repository](https://github.com/opendatahub-io/jupyterhub-odh)
2. Apply the required changes.
3. Push the changes in the JSP library
4. Modify the `jupyterhub-singleuser-profiles` value in the jupyterhub-odh [Pipfile](https://github.com/opendatahub-io/jupyterhub-odh/blob/master/Pipfile) to ``` {ref = "branch-name",git = "https://github.com/<username>/jupyterhub-singleuser-profiles.git"} ``` where the `git` value should point to your fork
5. Run the `pipenv lock` command. Save all changes and push them to the jupyterhub-odh repo
6. Access the `jupyterhub-img` `BuildConfig` on your cluster. 
7. Look for the `uri` value under `source`, Change it to your fork adress. Then add a `ref` value under `uri`, which will contain the name of your branch.
8. Start the build. 
9. When the build finishes, change the highlighted images to `jupyterhub-img:latest` 

``` 
    spec:
      containers:
      - env:
        - name: NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        . . .
        - name: TRAEFIK_API_PASSWORD
          valueFrom:
            secretKeyRef:
              name: $(traefik_credentials_secret)
              key: TRAEFIK_API_PASSWORD
        <mark>image: quay.io/odh-jupyterhub/jupyterhub-img:v0.3.3</mark>
        imagePullPolicy: "Always"
        name: jupyterhub
        ports:
        - containerPort: 8080
          protocol: TCP
        resources:
          limits:
            cpu: "1"
            memory: 1Gi
          requests:
            cpu: "200m"
            memory: 1Gi
        volumeMounts:
        - mountPath: /opt/app-root/configs
          name: config
        readinessProbe:
            tcpSocket:
              port: 8081
            initialDelaySeconds: 15
            periodSeconds: 10
      - name: jupyterhub-ha-sidecar
        image: 'registry.redhat.io/openshift4/ose-leader-elector-rhel8:v4.7'
        args:
          - '--election=jupyterhub-ha-election'
          - '--election-namespace=$(NAMESPACE)'
          - '--http=0.0.0.0:4040'
          - '--id=$(POD_NAME)'
        env:
          - name: NAMESPACE
            valueFrom:
              fieldRef:
                apiVersion: v1
                fieldPath: metadata.namespace
          - name: POD_NAME
            valueFrom:
              fieldRef:
                apiVersion: v1
                fieldPath: metadata.name
      initContainers:
      - command:
        - wait-for-database
        env:
        - name: JUPYTERHUB_DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: $(jupyterhub_secret)
              key: POSTGRESQL_PASSWORD
        - name: JUPYTERHUB_DATABASE_HOST
          value: jupyterhub-db
        <mark>image: quay.io/odh-jupyterhub/jupyterhub-img:v0.3.3</mark>
        imagePullPolicy: "Always"
        name: wait-for-database 
```

### Notes

If you are missing the `BuildConfig` and `Imagestream` resources, copy the yaml files here: [jupyterhub BuildConfig](https://github.com/opendatahub-io/odh-manifests/blob/master/jupyterhub/jupyterhub/overlays/build/jupyterhub-buildconfig.yaml),[jupyterhub-img BuildConfig](https://github.com/opendatahub-io/odh-manifests/blob/master/jupyterhub/jupyterhub/overlays/build/jupyterhub-dh-buildconfig.yaml), [jupyterhub ImageStream](https://github.com/opendatahub-io/odh-manifests/blob/master/jupyterhub/jupyterhub/overlays/build/jupyterhub-imagestream.yaml), [jupyterhub-img ImageStream](https://github.com/opendatahub-io/odh-manifests/blob/master/jupyterhub/jupyterhub/overlays/build/jupyterhub-img-imagestream.yaml), and create the resources in the openshift console, then modify them according to the instructions above. Make sure the `jupyterhub` build is started and runs through before starting `jupyterhub-img`.

## API

To test the API of the JSP library the same steps apply. Following these steps, it is necessary to go to the jupyterhub `route`. To get to the debug UI of the AI use the following link: `<jupyterhub route>/services/api/ui`

Any errors of the API will appear in the main `jupyterhub` pod. To configure these logs follow the instructions in the notes section of the JSP testing manual above.

## UI

To test the Spawner UI, follow the steps in the JSP section above. Then follow the jupyterhub `route`.

Any errors will appear in the console accessed with F12. Closer information about the error may be available in the `jupyterhub` pod.

For further information such as local testing of the UI, follow instructions of the testing section of the [UI Readme](../jupyterhub_singleuser_profiles/ui/README.md#testing)