import os
import yaml
import logging


_LOGGER = logging.getLogger(__name__)

class Sizes(object):
    def __init__(self, sizes):
        self.sizes = sizes

    def get_size(self, size):
        for s in self.sizes:
            if s['name'] == size:
                return s

        return {}

    def get_form(self, last_size=None):
        template = """
        <h3>Deployment sizes</h3>
        <label for="size">Select desired container size</label>
        <select class="form-control" name="size" size="1">
        %s
        </select>
        """

        options = ["<option value='None'>Default (resources will be set based on profiles configured by administrator)</option>"]
        for size in self.sizes: 
            selected = ""
            if size['name'] == last_size:
                selected = "selected=selected"
            if size['resources'].get('mem_limit') or size['resources'].get('cpu_limit'):
                # Kept for backwards compatibility
                options.append("<option value='%s' %s>%s</option>" % (size['name'], selected, "%s (Memory: %s, CPU: %s)" % (size['name'], size['resources']['mem_limit'], size['resources']['cpu_limit'])))
            else:
                if size['resources'].get('requests') is None:
                    size['resources']['requests'] = size['resources']['limits']
                elif size['resources'].get('limits') is None:
                    size['resources']['limits'] = size['resources']['requests']

                req_mem = size['resources']['requests']['memory']
                req_cpu = size['resources']['requests']['cpu']
                lim_mem = size['resources']['limits']['memory']
                lim_cpu = size['resources']['limits']['cpu']
                options.append("<option value='%s' %s>%s</option>" % (size['name'], selected, "%s (Memory request: %s, CPU request: %s, Memory limit: %s, CPU limit: %s)" % (size['name'], req_mem, req_cpu, lim_mem, lim_cpu)))

        return template % "\n".join(options) if options else ""