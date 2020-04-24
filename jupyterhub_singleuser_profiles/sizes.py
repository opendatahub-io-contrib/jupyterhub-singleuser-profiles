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

    def get_sizes(self):
        return self.sizes

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
            options.append("<option value='%s' %s>%s</option>" % (size['name'], selected, "%s (Memory: %s, CPU: %s)" % (size['name'], size['resources']['mem_limit'], size['resources']['cpu_limit'])))

        return template % "\n".join(options) if options else ""