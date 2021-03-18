import os
import json
from kubernetes import config, client
from openshift.dynamic import DynamicClient
import yaml
import logging
import requests
from kubernetes.client.rest import ApiException
from .utils import escape
import jinja2
import re


_LOGGER = logging.getLogger(__name__)

_SERVICE_LABEL="jupyterhub-singluser-service"
_REFERENCE_CM_NAME = "singleuser-service-ref-%s"

class Service():
  def __init__(self, openshift_wrapper, namespace):
    self.os_client = openshift_wrapper.oapi_client
    self.namespace = namespace

  def get_service_reference_config_map (self, user):
    cm_name =  _REFERENCE_CM_NAME %(escape(user))
    config_map_wrapper = self.os_client.resources.get(api_version='v1', kind='ConfigMap')
    try:
      body = {
          'kind': 'ConfigMap',
          'apiVersion': 'v1',
          'metadata': {'name': cm_name},
          'data': {}
        }
      config_map_wrapper.create(body=body, namespace=self.namespace)

    except ApiException as e:
      if e.status != 409:
        _LOGGER.error("Error creating reference ConfigMap in %s for %s: %s\n" % (self.namespace, escape(user), e))
        raise
      else:
        _LOGGER.info("Could not create the reference ConfigMap %s - already exist." % cm_name)

    result = config_map_wrapper.get(namespace=self.namespace, name=cm_name)
    return result


  def get_template(self, name, path):
    template = None
    cm_wrapper = self.os_client.resources.get(api_version='v1', kind='ConfigMap')
    try:
      response = cm_wrapper.get(
          namespace=self.namespace,
          name=name
      )
      cm = response.to_dict()
      if cm['data'].get(path):
        template = cm['data'].get(path)
    except Exception as e:
      _LOGGER.error("Error: %s %s" % (name, e))

    return template

  def process_template(self, user, service_name, template, configuration, labels=None):
    user_e = escape(user)
    tmp = jinja2.Template(template)
    configuration['user'] = user_e
    result = tmp.render(configuration)
    result = yaml.load(result)
    if not result.get('metadata'):
      result['metadata'] = {}
    if labels:
      result['metadata']['labels'].update(labels)
    if (result['metadata']['name'].find(user_e) == -1):
      result['metadata']['name'] = re.sub("-+", "-", "%s-%s" %(result['metadata']['name'], user_e))

    return result

  def get_owner_references(self, user):
    ref_cm = self.get_service_reference_config_map(user)
    return {
            'kind' : ref_cm['kind'],
            'apiVersion' : ref_cm['apiVersion'],
            'name' : ref_cm['metadata']['name'],
            'uid' : ref_cm['metadata']['uid']
          }

  def deploy_services(self, services, user):
    deployed_services = []
    envs = []
    owner_references = self.get_owner_references(user)
    for service_name, service in services.items():
      if not service.get("resources"):
        raise Exception('Trying to setup service "%s" for user %s: missing "resources" key in definition' % (service_name, user))
      for resource in service.get("resources"):
        template = None
        if resource.get("name") is not None:
          template = self.get_template(resource.get("name"), resource.get("path"))
        if not template:
          _LOGGER.warning("Could not find specified template ConfigMap %s, Skipping setting up service %s" % (resource['name'], service_name))
          continue
        processed_template = self.process_template(user, service_name, template, service.get("configuration", {}), service.get("labels", {}))
        deployed_services.append(processed_template)
        submit_result = self.submit_resource(processed_template, service.get("return", {}), owner_references, user)
        if submit_result:
          envs.append(submit_result)
        else:
          _LOGGER.error("Failed to submit resource %s" % processed_template['metadata']['name'])
    return deployed_services, envs

  def submit_resource(self, processed_template, return_paths, owner_references, user):
    resource_name = processed_template['metadata']['name']

    # ownerRefernces allow us to use garbage collection to clean up service manifests
    if not processed_template['metadata'].get('ownerReferences'):
      processed_template['metadata']['ownerReferences'] = []
    processed_template['metadata']['ownerReferences'].append(owner_references)

    response = None
    client_wrapper = self.os_client.resources.get(api_version=processed_template['apiVersion'], kind=processed_template['kind'])
    try:
      response = client_wrapper.create(body=processed_template, namespace=self.namespace)
    except ApiException as e:
      try:
        if e.status == 409:
          _LOGGER.info("Resource %s exists, trying to replace." % resource_name)
          original_resource = client_wrapper.get(name=resource_name, namespace=self.namespace)
          original_resource_dict = original_resource.to_dict()

          # Added because of https://github.com/kubernetes/kubernetes/issues/70674#issuecomment-438569688
          processed_template['metadata']['resourceVersion'] = original_resource_dict['metadata']['resourceVersion']

          response = client_wrapper.replace(body=processed_template, namespace=self.namespace)
        else:
          _LOGGER.error("Error when trying to create resource %s: %s\n" % (resource_name, e))
          raise
      except ApiException as e2:
        _LOGGER.error("Error when trying to replace resource %s: %s\n" % (resource_name, e2))
        raise

    result = self._get_data_from_response(response, return_paths)
    return result

  def delete_reference_cm(self, user):
    cm_name = _REFERENCE_CM_NAME % escape(user)
    try:
      wrapper = self.os_client.resources.get(api_version='v1', kind='ConfigMap')
      wrapper.delete(namespace=self.namespace, name=cm_name)
    except ApiException as e:
      if e.status == 404:
        _LOGGER.info("Reference ConfigMap %s does not exist. Probably no services were setup for the profile" % cm_name)
      else:
        _LOGGER.error("Error when trying to delete the service reference ConfigMap of %s: %s\n" % (user, e))
        raise

  def _get_data_from_response(self, response, return_paths):
    import jsonpath_rw
    result = {}
    if not response:
      return result
    data = response.to_dict()
    for key, json_path in return_paths.items():
      
      jsonpath_expr = jsonpath_rw.parse(json_path)
      matches = jsonpath_expr.find(data)
      if len(matches) == 1:
        result[key] = str(matches[0].value)
      else:
        result[key] = ",".join([str(match.value) for match in matches])
    return result
