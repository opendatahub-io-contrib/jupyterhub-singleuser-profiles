import os
import yaml
import logging
import json
from pydantic import BaseModel
from typing import List, Optional

_LOGGER = logging.getLogger(__name__)
IMAGE_LABEL = 'opendatahub.io/notebook-image'

class NameVersionPair(BaseModel):
    name: str
    version: str

class ImageTagInfo(BaseModel):
    software: Optional[List[NameVersionPair]]
    dependencies: Optional[List[NameVersionPair]]

class ImageInfo(BaseModel):
    description: Optional[str]
    url: Optional[str]
    display_name: Optional[str]
    name: str
    content: ImageTagInfo

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
        image_list, code = self.get(detailed=False)

        if len(image_list) > 0:
            return image_list[0]

        return ''

    def tag_exists(self, tag_name, imagestream):
        for tag in imagestream.spec.tags:
            if tag_name == tag.name:
                return True

        return False

    def get_info(self, image_name):
        imagestream_list = self.openshift.get_imagestreams(IMAGE_LABEL+'=true')
        #abreviations
        name, tag_name = image_name.split(':')
        desc = 'opendatahub.io/notebook-image-desc'
        display_name = 'opendatahub.io/notebook-image-name'
        url = 'opendatahub.io/notebook-image-url'
        software = 'opendatahub.io/notebook-software'
        dependencies = 'opendatahub.io/notebook-python-dependencies'
        tag_annotations = None

        for i in imagestream_list.items:
            if i.metadata.name == name:
                annotations = i.metadata.annotations
                for tag in i.spec.tags:
                    if tag.name == tag_name:
                        tag_annotations = tag.annotations
                if not tag_annotations:
                    _LOGGER.error("Image tag not found!")
                    return "Image tag not found", 404

                return ImageInfo(description=annotations.get(desc),
                                    url=annotations.get(url),
                                    display_name=annotations.get(display_name),
                                    name=image_name,
                                    content=ImageTagInfo(
                                        software=json.loads(tag_annotations.get(software, "[]")),\
                                        dependencies=json.loads(tag_annotations.get(dependencies, "[]"))
                                    )
                                ).dict(), 200
        return "Image not found", 404

    def append_option(self, image, result):
        name = image.metadata.name
        if not image.status.tags:
            return
        for tag in image.status.tags:
            if not self.tag_exists(tag.tag, image):
                continue
            selected = ""
            image_tag = "%s:%s" % (name, tag.tag)
            result.append(image_tag)

    def get(self, detailed=True):
        images = []
        code = 200
        imagestream_list = self.openshift.get_imagestreams(IMAGE_LABEL+'=true')

        if len(imagestream_list.items) == 0:
            self.get_images_legacy(images)
        else:
            for i in imagestream_list.items:
                self.append_option(i, images)

        result = []
        if detailed:
            for image in images:
                image_info, code = self.get_info(image)
                if code == 200:
                    result.append(image_info)
        else:
            result = images


        return result, code


