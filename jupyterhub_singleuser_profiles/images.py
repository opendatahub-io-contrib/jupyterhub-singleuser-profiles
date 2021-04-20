import os
import yaml
import logging
import json
from pydantic import BaseModel
from typing import List, Optional

_LOGGER = logging.getLogger(__name__)
IMAGE_LABEL = 'opendatahub.io/notebook-image'

class NameVersionPair(BaseModel):
    name: Optional[str]
    version: Optional[str]

class ImageTagInfo(BaseModel):
    software: Optional[List[NameVersionPair]]
    dependencies: Optional[List[NameVersionPair]]

class ImageInfo(BaseModel):
    description: Optional[str]
    url: str
    name: str
    tag_specific: ImageTagInfo

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

    def get_info(self, image_name):
        imagestream_list = self.openshift.get_imagestreams(IMAGE_LABEL+'=true')
        #abreviations
        image_name, tag_name = image_name.split(':')
        desc = 'opendatahub.io/notebook-image-desc'
        name = 'opendatahub.io/notebook-image-name'
        url = 'opendatahub.io/notebook-image-url'
        software = 'opendatahub.io/notebook-software'
        dependencies = 'opendatahub.io/notebook-python-dependencies'
        tag_annotations = None

        for i in imagestream_list.items:
            if i.metadata.name == image_name:
                annotations = i.metadata.annotations
                for tag in i.spec.tags:
                    if tag.name == tag_name:
                        tag_annotations = tag.annotations
                if not tag_annotations:
                    _LOGGER.error("Image tag not found!")
                    return "Image tag not found", 404
                return ImageInfo(description=annotations.get(desc),
                                    url=annotations.get(url),
                                    name=annotations.get(name),
                                    tag_specific=ImageTagInfo(
                                        software=tag_annotations.get(software),\
                                        dependencies=tag_annotations.get(dependencies)
                                    )
                                ).dict()
        return "Image not found", 404

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


