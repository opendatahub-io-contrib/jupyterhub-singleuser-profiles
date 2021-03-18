import os
import yaml
import logging
import json

_LOGGER = logging.getLogger(__name__)
IMAGE_LABEL = 'opendatahub.io/notebook-image'

class Images(object):
    def __init__(self, openshift, namespace):
        self.openshift = openshift
        self.namespace = namespace
    

    def get_images_legacy(self, result):
        """Kept for backwards compatibility"""

        for i in self.openshift.get_imagestreams().items:
            if '-notebook' in i.metadata.name:
                self.append_option(i, result)

    def get_default(self):
        image_list = self.get()

        if len(image_list) > 0:
            return image_list[0]

        return ''

    def append_option(self, image, result):
        name = image.metadata.name
        if not image.status.tags:
            return
        for tag in image.status.tags:
            selected = ""
            image_tag = "%s:%s" % (name, tag.tag)
            result.append(image_tag)

    def get(self):
        result = []
        imagestream_list = self.openshift.get_imagestreams(IMAGE_LABEL+'=true')

        if len(imagestream_list.items) == 0:
            self.get_images_legacy(result)
        else:
            for i in imagestream_list.items:
                self.append_option(i, result)

        return result
