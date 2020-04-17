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
  def __init__(self, server_url, token, namespace=None, verify_ssl=True):
    self.server_url = server_url
    self.token = token
    service_account_path = '/var/run/secrets/kubernetes.io/serviceaccount'

    if namespace:
      self.namespace = namespace
    else:
      with open(os.path.join(service_account_path, 'namespace')) as fp:
          self.namespace = fp.read().strip()

    self.verify_ssl = verify_ssl

    configuration = client.Configuration()
    configuration.verify_ssl = self.verify_ssl
    try:
      config.load_incluster_config()
    except Exception as e:
      config.load_kube_config(client_configuration=configuration)

    k8s_client = client.ApiClient(configuration=configuration)
    self.k8s_api_instance = client.CoreV1Api(k8s_client)
    self.os_client = DynamicClient(k8s_client)

  def get_service_reference_config_map (self, user):
    config_map_wrapper = self.os_client.resources.get(api_version='v1', kind='ConfigMap')
    try:
      body = {
          'kind': 'ConfigMap',
          'apiVersion': 'v1',
          'metadata': {'name': _REFERENCE_CM_NAME %(escape(user))},
          'data': {}
        }
      config_map_wrapper.create(body=body, namespace=self.namespace)

    except ApiException as e:
      if e.status != 409:
        _LOGGER.error("Error creating reference ConfigMap in %s for %s: %s\n" % (self.namespace, escape(user), e))
        raise

    result = config_map_wrapper.get(namespace=self.namespace, name=_REFERENCE_CM_NAME %(escape(user)))
    return result


  def get_template(self, name, path):
    cm_wrapper = self.os_client.resources.get(api_version='v1', kind='ConfigMap')
    try:
      response = cm_wrapper.get(
          namespace=self.namespace,
          name=name
      )
      cm = response.to_dict()
    except Exception as e:
      _LOGGER.error("Error: %s %s" % (name, e))
      template = None
    template = yaml.load(cm['data'].get(path))

    return template

  def process_template(self, user, service_name, template, configuration, labels=None):

    tmp = jinja2.Template(json.dumps(template))
    configuration['user'] = user
    result = tmp.render(configuration)
    result = json.loads(result)
    if not result.get('metadata'):
      result['metadata'] = {}
    if labels:
      result['metadata']['labels'].update(labels)
    if (result['metadata']['name'].find(user) == -1):
      result['metadata']['name'] = re.sub("-+", "-", "%s-%s" %(result['metadata']['name'], user))

    return result

  def get_owner_references(self, user):
    ref_cm = self.get_service_reference_config_map(user)
    return [{
            'kind' : ref_cm['kind'],
            'apiVersion' : ref_cm['apiVersion'],
            'name' : ref_cm['metadata']['name'],
            'uid' : ref_cm['metadata']['uid']
          }]

  def deploy_services(self, services, user):
    deployed_services = []
    envs = []
    owner_references = self.get_owner_references(user)
    for service_name, service in services.items():
      for resource in service.get("resources"):
        if resource.get("name") is not None:
          template = self.get_template(resource.get("name"), resource.get("path"))
        if not template:
          _LOGGER.warning("Could not find specified template ConfigMap %s, Skipping setting up service %s" % (resource['name'], service_name))
          continue
        processed_template = self.process_template(user, service_name, template, service.get("configuration", {}), service.get("labels", {}))
        deployed_services.append(processed_template)
        envs.append(self.submit_resource(processed_template, service.get("return", {}), owner_references, user))
    return deployed_services, envs

  def submit_resource(self, processed_template, return_paths, owner_references, user):
    client_wrapper = self.os_client.resources.get(api_version=processed_template['apiVersion'], kind=processed_template['kind'])
    try:

      processed_template['metadata']['ownerReferences'] = owner_references
      response = client_wrapper.create(body=processed_template, namespace=self.namespace)
      result = self._get_data_from_response(response, return_paths)
      return result
    except ApiException as e:
      try:
        if e.status == 409:
          original_resource = client_wrapper.get(name=processed_template['metadata']['name'], namespace=self.namespace)
          original_dict = original_resource.to_dict()

          # Added because of https://github.com/kubernetes/kubernetes/issues/70674#issuecomment-438569688
          processed_template['metadata']['resourceVersion'] = original_dict['metadata']['resourceVersion']
          # Necessary for deletion purposes using garbage collection
          processed_template['metadata']['ownerReferences'] = owner_references

          response = client_wrapper.replace(body=processed_template, namespace=self.namespace)
          result = self._get_data_from_response(response, return_paths)
          return result
        else:
          _LOGGER.error("Error when trying to submit resource %s: %s\n" % (processed_template['metadata']['name'], e))
          raise
      except ApiException as e2:
        _LOGGER.error("Error when trying to submit resource %s: %s\n" % (processed_template['metadata']['name'], e2))

  def delete_reference_cm(self, user):
    try:
      wrapper = self.os_client.resources.get(api_version='v1', kind='ConfigMap')
      wrapper.delete(namespace=self.namespace, name=_REFERENCE_CM_NAME %(user))
    except ApiException as e:
      _LOGGER.error("Error when trying to delete the service reference ConfigMap of %s: %s\n" % (user, e))

  def _get_data_from_response(self, response, return_paths):
    import jsonpath_rw
    result = {}
    data = response.to_dict()
    for key, json_path in return_paths.items():
      
      jsonpath_expr = jsonpath_rw.parse(json_path)
      matches = jsonpath_expr.find(data)
      if len(matches) == 1:
        result[key] = str(matches[0].value)
      else:
        result[key] = ",".join([str(match.value) for match in matches])
    return result

  def _set_template_parameters(self, template, **parameters):
    """Set parameters in the template - replace existing ones or append to parameter list if not exist.
    >>> _set_template_parameters(template, THOTH_LOG_ADVISER='DEBUG')
    """
    if 'parameters' not in template:
        template['parameters'] = []

    for parameter_name, parameter_value in parameters.items():
        for entry in template['parameters']:
            if entry['name'] == parameter_name:
                entry['value'] = str(parameter_value)
                break
        else:
            template['parameters'].append({
                'name': parameter_name,
                'value': str(parameter_value)
            })