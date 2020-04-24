import os
from kubernetes import config, client
from openshift.dynamic import DynamicClient
import yaml
import logging
import requests
from kubernetes.client.rest import ApiException
from .utils import escape


_LOGGER = logging.getLogger(__name__)

_SERVICE_LABEL="jupyterhub-singluser-service"

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
      print("EXCEPTION", e)
      config.load_kube_config(client_configuration=configuration)

    k8s_client = client.ApiClient(configuration=configuration)
    self.k8s_api_instance = client.CoreV1Api(k8s_client)
    self.os_client = DynamicClient(k8s_client)

  def get_template(self, name):
    tmplt = self.os_client.resources.get(api_version='template.openshift.io/v1', kind='Template')
    if isinstance(tmplt, list):
      tmplt = tmplt[0] # Openshift returns list of 2 resource types, we want template.openshift.io/v1/processedtemplates

    try:
      response = tmplt.get(
          namespace=self.namespace,
          name=name
      )
      template = response.to_dict()
    except Exception as e:
      _LOGGER.error("Error: %s %s" % (name, e))
      template = None

    return template

  def process_template(self, user, template, **parameters):

    self._set_template_parameters(
      template,
      USERNAME=escape(user),
      **parameters
    )
    template["apiVersion"] = "template.openshift.io/v1"

    endpoint = "{}/apis/template.openshift.io/v1/namespaces/{}/processedtemplates".format(
        self.server_url,
        self.namespace
    )
    response = requests.post(
        endpoint,
        json=template,
        headers={
            'Authorization': 'Bearer {}'.format(self.token),
            'Content-Type': 'application/json'
        },
        verify=False #FIXME?
    )
    _LOGGER.debug("OpenShift master response template (%d): %r", response.status_code, response.text)

    try:
        response.raise_for_status()
    except Exception:
        _LOGGER.error("Failed to process template: %s", response.text)
        raise

    processed = response.json()
    if len(processed["objects"]) != 1:
      raise Exception("Template must contain a single ConfigMap or CustomResource")

    configMap = processed["objects"][0]
    if not configMap["metadata"].get("labels"):
      configMap["metadata"]["labels"] = {}

    configMap["metadata"]["labels"][_SERVICE_LABEL] = escape(user)

    return configMap

  def submit_resource(self, resource, return_paths):
    if resource["kind"] == "ConfigMap":
      name = resource["metadata"]["name"]
      try: 
        api_response = self.k8s_api_instance.replace_namespaced_config_map(name, self.namespace, resource, pretty="true", )
        result = self._get_data_from_response(api_response, return_paths)
        return result
      except ApiException as e:
        try:
          if e.status == 404:
            api_response = self.k8s_api_instance.create_namespaced_config_map(self.namespace, resource, pretty="true")
            result = self._get_data_from_response(api_response, return_paths)
            return result
          else:
            _LOGGER.error("Exception when calling CoreV1Api->replace_namespaced_config_map: %s\n" % e)
            raise
        except ApiException as e2:
          _LOGGER.error("Exception when calling CoreV1Api->create_namespaced_config_map: %s\n" % e2)

  def delete_resource_by_service_label(self, label_value):
    api_response = self.k8s_api_instance.list_namespaced_config_map(self.namespace, label_selector="%s=%s" % (_SERVICE_LABEL, escape(label_value)))
    for item in api_response.to_dict()['items']:
      try:
        self.k8s_api_instance.delete_namespaced_config_map(item["metadata"]["name"], self.namespace, client.V1DeleteOptions())
      except ApiException as e:
        _LOGGER.error("Exception when calling CoreV1Api->delete_namespaced_config_map: %s\n" % e)

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