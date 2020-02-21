import os
import yaml
import logging

_LOGGER = logging.getLogger(__name__)

class Images(object):
    def __init__(self, oapi_client, namespace):
        self.oapi_client = oapi_client
        self.namespace = namespace

        
    
    def get_images(self):

        imagestreams = self.oapi_client.resources.get(kind='ImageStream', api_version='image.openshift.io/v1')
        imagestream_list = imagestreams.get(namespace=self.namespace)

        return imagestream_list

    
    def get_form(self, last_image=None):

        result = []


        for i in self.get_images().items:
            if "-notebook" in i.metadata.name:
                name = i.metadata.name
                if not i.status.tags:
                    continue
                for tag in i.status.tags:
                    selected = ""
                    image = "%s:%s" % (name, tag.tag)
                    if image == last_image:
                        selected = "selected=selected"
                    result.append("<option value='%s' %s>%s</option>" % (image, selected, image))
                    

        response = """
        <h3>JupyterHub Server Image</h3>
        <label for="custom_image">Select desired notebook image</label>
        <select class="form-control" name="custom_image" size="1">
        %s
        </select>
        \n
        """ % "\n".join(result)

        return response


