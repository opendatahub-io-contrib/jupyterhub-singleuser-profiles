import os
import sys
import base64

import requests
import yaml
import kubernetes
import logging
from kubernetes.client.rest import ApiException
from openshift.dynamic import DynamicClient
from kubernetes.client import V1ObjectMeta, V1ConfigMap, V1Secret, V1EnvVar, V1SecretKeySelector, V1ConfigMapKeySelector, V1EnvVarSource
import urllib3
from prometheus_api_client import PrometheusConnect

urllib3.disable_warnings()

_LOGGER = logging.getLogger(__name__)


class OpenShift(object):
  def __init__(self, namespace=None, verify_ssl=True, service_account_path='/var/run/secrets/kubernetes.io/serviceaccount'):
    self.api_client = None
    self.namespace = namespace #TODO why do I need to pass namespace?
    self.oapi_client = None

    if not self.namespace:
      with open(os.path.join(service_account_path, 'namespace')) as fp:
          self.namespace = fp.read().strip()

    try:
      kubernetes.config.load_incluster_config()
    except Exception as e:
      kubernetes.config.load_kube_config()

    self.api_client = kubernetes.client.CoreV1Api()

    configuration = kubernetes.client.Configuration()
    configuration.verify_ssl = verify_ssl
    self.oapi_client = DynamicClient(
      kubernetes.client.ApiClient(configuration=configuration)
    )

  def get_config_maps_matching_label(self, target_label='jupyterhub=singleuser-profiles'):
    config_maps_list = []
    try:
      config_maps = self.api_client.list_namespaced_config_map(self.namespace, label_selector=target_label)
    except ApiException as e:
      if e.status != 404:
        _LOGGER.error(e)
      return config_maps_list
    for cm in config_maps.items:
      config_maps_list.append(cm.metadata.name)

    _LOGGER.info("Found these additional Config Maps: %s" % config_maps_list)
    return config_maps_list

  def read_config_map(self, config_map_name, key_name=None, notebook_namespace=None):
    result = {}
    try:
      if notebook_namespace is None:
        notebook_namespace = self.namespace
      config_map = self.api_client.read_namespaced_config_map(config_map_name, notebook_namespace)
    except ApiException as e:
      if e.status != 404:
        _LOGGER.error("Error reading a config map %s: %s" % (config_map_name, e))
      return result

    if key_name:
      result = yaml.load(config_map.data[key_name])
    else:
      result = config_map.data
    return result

  def read_secret(self, secret_name, key_name=None, notebook_namespace=None):
    result = {}
    try:
      if notebook_namespace is None:
        notebook_namespace = self.namespace
      secret = self.api_client.read_namespaced_secret(secret_name, notebook_namespace)
    except ApiException as e:
      if e.status != 404:
        _LOGGER.error("Error reading a secret %s: %s" % (secret_name, e))
      return result
    if secret.data:
      if key_name:
        content = self.decode_secret(secret.data[key_name])
        result = yaml.load(content)
      else:
        result = dict([(key, self.decode_secret(value)) for key, value in secret.data.items()])

    return result

  def decode_secret(self, data):
    base64_bytes = data.encode('utf8')
    secret_bytes = base64.b64decode(base64_bytes)
    content = secret_bytes.decode('utf8')

    return content


  def write_config_map(self, config_map_name, data, key_name=None, notebook_namespace=None):
    cm = V1ConfigMap()
    cm.metadata = V1ObjectMeta(name=config_map_name, labels={'app': 'jupyterhub'})
    if notebook_namespace is None:
      notebook_namespace = self.namespace
    if key_name:
      cm.data = {key_name: yaml.dump(data, default_flow_style=False)}
    else:
      cm.data = data
    try:
      api_response = self.api_client.replace_namespaced_config_map(config_map_name, notebook_namespace, cm)
    except ApiException as e:
      if e.status == 404:
        try:
          api_response = self.api_client.create_namespaced_config_map(notebook_namespace, cm)
        except ApiException as e:
          _LOGGER.error("Exception when calling CoreV1Api->create_namespaced_config_map: %s\n" % e)
      else:
        raise

  def write_secret(self, secret_name, data, key_name=None, notebook_namespace=None):
    secret = V1Secret()
    secret.metadata = V1ObjectMeta(name=secret_name, labels={'app': 'jupyterhub'})
    if notebook_namespace is None:
      notebook_namespace = self.namespace
    if key_name:
      secret.string_data = {key_name: yaml.dump(data, default_flow_style=False)} #stringData instead of data here to make kubernetes parse this as a string without base64 encoding
    else:
      secret.string_data = data
    try:
      api_response = self.api_client.replace_namespaced_secret(secret_name, notebook_namespace, secret)
    except ApiException as e:
      if e.status == 404:
        try:
          api_response = self.api_client.create_namespaced_secret(notebook_namespace, secret)
        except ApiException as e:
          _LOGGER.error("Exception when calling CoreV1Api->create_namespaced_secret: %s\n" % e)
      else:
        raise

  def get_nodes(self):
    nodes = self.oapi_client.resources.get(kind='Node', api_version='v1')
    node_list = nodes.get()
    return node_list

  def calc_cpu(self, cpu_str):
    if (type(cpu_str) != int and type(cpu_str) != float) and cpu_str[-1] == 'm': #Can sometimes be numeric
      cpu = float(cpu_str[:-1])/1000
    else:
      cpu = float(cpu_str)
    return cpu

  # Returns memory in Gi
  def calc_memory(self, memory_str):
    if memory_str[-2:] == 'Ki':
      memory = float(memory_str[:-2])/1000000
    elif memory_str[-2:] == 'Mi':
      memory = float(memory_str[:-2])/1000
    elif memory_str[-2:] == 'Gi':
      memory = float(memory_str[:-2])
    elif memory_str[-1:] == 'm':
      memory = float(memory_str[:-1])/1000000000000
    else:
      # Memory unit is bytes
      memory = float(memory_str)/1000000000
    return memory

  def get_openshift_prometheus_token(self):
    service_account = self.api_client.read_namespaced_service_account("prometheus-k8s", "openshift-monitoring")
    token_secret_name = [s for s in service_account.secrets if 'token' in s.name][0].name
    secret = self.api_client.read_namespaced_secret(token_secret_name, "openshift-monitoring")
    # get base64 encoded Prometheus token from the secret
    prometheus_token = secret.data.get('token')
    prometheus_token_str = str(base64.b64decode(prometheus_token.strip()), 'utf-8')

    return prometheus_token_str

  def get_prometheus_url(self):
    prom_service = self.api_client.read_namespaced_service("prometheus-k8s", "openshift-monitoring")
    prom_port = ""
    for pport in prom_service.spec.ports:
      if pport.name == "web":
        prom_port = str(pport.port)
    url = "https://" + prom_service.spec.cluster_ip + ":" + prom_port
    return url

# get_gpu_number returns maximum GPUs available in a node.
# It uses metrics exposed by the dcgm_exporter when gpu operator is installed
# Example Usecase: 2 GPU nodes with 1 GPU in each:
#   When all GPUs are available: returns 1 (max value in any given node)
#   When 1 GPU is in use: returns 1 (max available value in other node)
#   When both GPUs are in use: returns 0
  def get_gpu_number(self):
    max_available_gpu = 0
    pod_list = []
    ## Verify if dcgm-exporter is deployed
    try:
      pod_list = self.api_client.list_pod_for_all_namespaces(label_selector="app=nvidia-dcgm-exporter")
    except ApiException as e:
      if e.status != 404:
        _LOGGER.error("Exception when calling DCGM exporter pods: %s\n" % e)

    if len(pod_list.items) != 0:
      prom = PrometheusConnect(
        url=self.get_prometheus_url(),
        headers={"Authorization": "Bearer " + self.get_openshift_prometheus_token()},
        disable_ssl=True)

      for pod in pod_list.items:
        pod_IP = pod.status.pod_ip
        gpu_query = 'count (count by (UUID,GPU_I_ID) (DCGM_FI_PROF_GR_ENGINE_ACTIVE{instance="' + pod_IP +\
                    ':9400"}) or vector(0)) - count(count by (UUID,GPU_I_ID) (DCGM_FI_PROF_GR_ENGINE_ACTIVE{instance="'\
                    + pod_IP + ':9400", exported_pod=~".+"}) or vector(0))'

        get_available_gpu_in_node_data = prom.custom_query(query=gpu_query)

        get_available_gpu_in_node = int(get_available_gpu_in_node_data[0]['value'][1])

        if get_available_gpu_in_node > max_available_gpu:
            max_available_gpu = get_available_gpu_in_node
    return max_available_gpu

  def get_node_capacity(self):
    cpu = 0
    cpu_alloc = 0
    memory = 0
    memory_alloc = 0
    node_list = self.get_nodes()
    node_cap_list = []
    for node in node_list.items:
      cpu = self.calc_cpu(node.status.capacity.get('cpu'))
      cpu_alloc = self.calc_cpu(node.status.allocatable.get('cpu'))
      memory = self.calc_memory(node.status.capacity.get('memory'))
      memory_alloc = self.calc_memory(node.status.allocatable.get('memory'))

      node_cap_list.append({
      'cpu': cpu,
      'allocatable_cpu': cpu_alloc,
      'memory': memory,
      'allocatable_memory': memory_alloc
      })
    node_cap_list.sort(key=lambda cap_dict:(cap_dict['allocatable_memory'],
                                            cap_dict['allocatable_cpu'],
                                            cap_dict['memory'],
                                            cap_dict['cpu']))
    return node_cap_list


  def get_imagestreams(self, label=None):
    imagestreams = self.oapi_client.resources.get(kind='ImageStream', api_version='image.openshift.io/v1')
    imagestream_list = imagestreams.get(namespace=self.namespace, label_selector=label)
    return imagestream_list

  def get_cluster_version(self, name):
    cluster_versions = self.oapi_client.resources.get(kind='ClusterVersion', api_version='config.openshift.io/v1')
    cluster_version =  cluster_versions.get(name=name, namespace=self.namespace)
    return cluster_version

  def get_builds(self):
    builds = self.oapi_client.resources.get(kind='Build', api_version='build.openshift.io/v1')
    build_list = builds.get(namespace=self.namespace)
    return build_list

  def create_pod_mapping(self, name, data, secret=False):
    result = []
    for item in data:
      env_var = V1EnvVar(name=item['name'])
      if secret:
        ref = V1SecretKeySelector(item['name'], name)
        env_var.value_from = V1EnvVarSource(secret_key_ref=ref)
      else:
        ref = V1ConfigMapKeySelector(item['name'], name)
        env_var.value_from = V1EnvVarSource(config_map_key_ref=ref)

      result.append(kubernetes.client.ApiClient().sanitize_for_serialization(env_var)) #We need to sanitize the V1EnvVar to be able to serialize it later

    return result
