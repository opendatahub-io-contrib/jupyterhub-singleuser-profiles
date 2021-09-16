import os
import yaml
import logging
import json
from distutils.util import strtobool
from pydantic import BaseModel
from typing import List, Optional

_LOGGER = logging.getLogger(__name__)
IMAGE_LABEL = 'opendatahub.io/notebook-image'
DEFAULT_IMAGE_ANNOTATION = 'opendatahub.io/default-image' #Used to find a default image is a user does not select any image
DESCRIPTION_ANNOTATION = 'opendatahub.io/notebook-image-desc'
DISPLAY_NAME_ANNOTATION = 'opendatahub.io/notebook-image-name'
URL_ANNOTATION = 'opendatahub.io/notebook-image-url'
SOFTWARE_ANNOTATION = 'opendatahub.io/notebook-software'
DEPENDENCIES_ANNOTATION = 'opendatahub.io/notebook-python-dependencies'
IMAGE_ORDER_ANNOTATION = 'opendatahub.io/notebook-image-order'
RECOMMENDED_ANNOTATION = 'opendatahub.io/notebook-image-recommended' #Used by UI to pick the right tag if user only selected an image, not image+tag

BUILD_NUMBER = 'openshift.io/build.number'

class NameVersionPair(BaseModel):
    name: str
    version: str

class TagContent(BaseModel):
    software: Optional[List[NameVersionPair]]
    dependencies: Optional[List[NameVersionPair]]

class ImageTagInfo(BaseModel):
    name: str
    content: TagContent
    recommended: bool
    build_status: str
    default: bool = False

class ImageInfo(BaseModel):
    name: str
    tags: List[ImageTagInfo]
    description: Optional[str]
    url: Optional[str]
    display_name: Optional[str]
    order: int = 100
    
class Images(object):
    def __init__(self, openshift, namespace):
        self.openshift = openshift
        self.namespace = namespace

    def get_default(self):
        image_list = self.load()
        first_image_with_tags = None

        for image in image_list:
            for tag in image.tags:
                if not first_image_with_tags:
                    first_image_with_tags = image
                if tag.default:
                    return self.get_default_image_tag(image, tag)

        return self.get_default_image_tag(first_image_with_tags)
    def get_default_image_tag(self, image, tag=None):
        if tag:
            return "%s:%s" % (image.name, tag.name)

        return "%s:%s" % (image.name, image.tags[0].name)

    def get_build_number(self, build):
        if build is None:
            return -1
        return int(build.metadata.annotations.get(BUILD_NUMBER))
    
    def get_image_build_status(self, imagestream_name):
        incomplete = ['Cancelled', 'Pending', 'New'] # Statuses greyed out by UI
        build_list = self.openshift.get_builds()
        latest_build = None
        for build in build_list.items:
            if imagestream_name == build.spec.output.to.name:
                if build.status.get('phase') not in incomplete:
                    if self.get_build_number(latest_build) < self.get_build_number(build):
                        latest_build = build
                if not latest_build:
                    latest_build = build # To prevent having no build as output if incomplete build exists
        if latest_build:
            return latest_build.status.get('phase')
        else:
            return 'Unknown'  # If no builds exist, do not consider status

    def tag_exists(self, tag_name, imagestream):
        """
        Check that tag_name exists in .status.tags. This handles situations where the tag exists but .spec.tags[] does not.
        """
        if imagestream.status:
            for tag in imagestream.status.get('tags', []):
                if tag_name == tag.tag:
                    return True

        return False

    def check_place(self, imagestream):
        return imagestream.order

    def load(self):
        result = []
        imagestream_list = self.openshift.get_imagestreams(IMAGE_LABEL+'=true')
        
        for i in imagestream_list.items:
            tag_list = []
            annotations = {}
            if i.metadata.annotations:
                annotations = i.metadata.annotations
            imagestream_tags = []
            if i.spec.tags:
                imagestream_tags = i.spec.tags

            if len(imagestream_tags) == 0:
                _LOGGER.warning(f'{i.metadata.name} does not have any tags')
                continue

            for tag in imagestream_tags:
                if not self.tag_exists(tag.name, i):
                    continue

                tag_annotations = {}
                if tag.annotations:
                    tag_annotations = tag.annotations

                # Default name if there is no display name annotation
                imagestream_name = "%s:%s" % (i.metadata.name, tag.name)

                tag_list.append(ImageTagInfo(content=TagContent(
                                                software=json.loads(tag_annotations.get(SOFTWARE_ANNOTATION, "[]")),
                                                dependencies=json.loads(tag_annotations.get(DEPENDENCIES_ANNOTATION, "[]"))
                                            ),
                                            name=tag.name,
                                            recommended=tag_annotations.get(RECOMMENDED_ANNOTATION, False),
                                            build_status=self.get_image_build_status(imagestream_name),
                                            default=bool(strtobool(tag_annotations.get(DEFAULT_IMAGE_ANNOTATION, "False")))
                ))

            result.append(ImageInfo(description=annotations.get(DESCRIPTION_ANNOTATION),
                                url=annotations.get(URL_ANNOTATION),
                                display_name=annotations.get(DISPLAY_NAME_ANNOTATION) or imagestream_name,
                                name=i.metadata.name,
                                tags=tag_list,
                                order=int(annotations.get(IMAGE_ORDER_ANNOTATION, 100)),
                                ))

        result.sort(key=self.check_place)

        return result

    def get(self):
        result = self.load()
 
        return [x.dict() for x in result]
