import os
import yaml
import logging
from .utils import parse_resources


_LOGGER = logging.getLogger(__name__)

class Sizes(object):
    def __init__(self, sizes):
        self.sizes = sizes

    def get_size(self, size):
        result = {}
        for s in self.sizes:
            if s['name'] == size:
                result = self._parse(s)

        if not result:
            result = {}

        return result

    def _parse(self, size):
        if 'name' not in size:
            return None

        if 'resources' not in size or not size.get('resources'):
            return None

        resources = parse_resources(size['resources'])

        if resources:
            size['resources'] = resources
        else:
            size = None

        return size

    def get_form(self, last_size=None):
        template = """
        <h3>Deployment sizes</h3>
        <label for="size">Select desired container size</label>
        <select class="form-control" name="size" size="1">
        %s
        </select>
        """

        options = ["<option value='None'>Default (resources will be set based on profiles configured by administrator)</option>"]
        for size_i in self.sizes: 
            size = self._parse(size_i)
            if not size:
                continue

            selected = ""
            if size['name'] == last_size:
                selected = "selected=selected"

            req_mem = size['resources']['requests'].get('memory', 'Default')
            req_cpu = size['resources']['requests'].get('cpu', 'Default')
            lim_mem = size['resources']['limits'].get('memory', 'Default')
            lim_cpu = size['resources']['limits'].get('cpu', 'Default')

            description = "%s (Memory request: %s, CPU request: %s, Memory limit: %s, CPU limit: %s)" % (size['name'], req_mem, req_cpu, lim_mem, lim_cpu)
            options.append("<option value='%s' %s>%s</option>" % (size['name'], selected, description))

        return template % "\n".join(options) if options else ""