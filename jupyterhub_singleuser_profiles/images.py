import os
import yaml
import logging
import json

_LOGGER = logging.getLogger(__name__)
IMAGE_LABEL = 'opendatahub.io/notebook-image'

class Images(object):
    def __init__(self, oapi_client, namespace):
        self.oapi_client = oapi_client
        self.namespace = namespace
    
    def get_images(self, label=None):

        imagestreams = self.oapi_client.resources.get(kind='ImageStream', api_version='image.openshift.io/v1')
        imagestream_list = imagestreams.get(namespace=self.namespace, label_selector=label)
        return imagestream_list

    def get_images_legacy(self, result, last_image, name_only=False):
        """Kept for backwards compatibility"""

        for i in self.get_images().items:
            if '-notebook' in i.metadata.name:
                self.append_option(i, result, last_image, name_only)

    def append_option(self, image, result, last_image, name_only=False):
        name = image.metadata.name
        if not image.status.tags:
            return
        for tag in image.status.tags:
            selected = ""
            image_tag = "%s:%s" % (name, tag.tag)
            if name_only:
                result.append(image_tag)
            else:
                if image_tag == last_image:
                    selected = "selected=selected"
                result.append("<option value='%s' %s>%s</option>" % (image_tag, selected, image_tag))

    def get_form(self, last_image=None, name_only=False):

        result = []
        imagestream_list = self.get_images(IMAGE_LABEL+'=true')

        if len(imagestream_list.items) == 0:
            self.get_images_legacy(result, last_image, name_only)
        else:
            for i in imagestream_list.items:
                self.append_option(i, result, last_image, name_only)

        response = """
        <h3>JupyterHub Server Image</h3>
        <label for="custom_image">Select desired notebook image</label>
        <select class="form-control" name="custom_image" size="1">
        %s
        </select>
        \n
        """ % "\n".join(result)

        if name_only:
            response = result

        return response


