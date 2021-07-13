import * as React from 'react';
import { Alert } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { APIGet, APIPost } from '../utils/APICalls';
import {
  ABOUT_NOTEBOOK_IMAGES_LINK,
  CM_PATH,
  DEFAULT_IMAGE_PATH,
  IMAGE_PATH,
} from '../utils/const';
import { ImageType, UserConfigMapType, UiConfigType } from '../utils/types';
import { isImageBuildInProgress } from './imageUtils';
import ImageSelector from './ImageSelector';

import './ImageForm.scss';

type ImageFormProps = {
  uiConfig: UiConfigType;
};

const getValuesFromImageName = (imageName: string): { image: string; tag: string } => {
  const index = imageName?.indexOf(':');
  return {
    image: index > 0 ? imageName.slice(0, index) : imageName || '',
    tag: index > 0 ? imageName.slice(index + 1) : '',
  };
};

const ImageForm: React.FC<ImageFormProps> = () => {
  const [selectedImageTag, setSelectedImageTag] = React.useState<{ image: string; tag: string }>();
  const [imageList, setImageList] = React.useState<ImageType[]>();

  const postChange = (text) => {
    const json = JSON.stringify({ last_selected_image: text });
    APIPost(CM_PATH, json);
  };

  React.useEffect(() => {
    let cancelled = false;
    APIGet(CM_PATH).then((data: UserConfigMapType) => {
      if (!cancelled) {
        setSelectedImageTag(getValuesFromImageName(data['last_selected_image']));
      }
    });
    APIGet(IMAGE_PATH).then((data: ImageType[]) => {
      if (!cancelled) {
        setImageList(data.sort((a, b) => a.order - b.order));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    // Wait until we have both
    if (!imageList || selectedImageTag === undefined) {
      return;
    }

    // If the previous are valid, we are good
    const currentImage = imageList.find((image) => image.name === selectedImageTag.image);
    const currentTag = currentImage?.tags?.find((tag) => tag.name === selectedImageTag.tag);
    if (currentImage && currentTag) {
      return;
    }

    // Fetch the defaults and use them
    APIGet(DEFAULT_IMAGE_PATH).then((data: string) => {
      if (!cancelled) {
        if (data) {
          // Use the default image path set
          const values = getValuesFromImageName(data);
          if (values.image && values.tag) {
            setSelectedImageTag(values);
            postChange(data);
            return;
          }
        }

        // Default not set or not found, find the default tag and set it as selected
        const defaultImage = imageList.find(
          (image) => image.tags?.find((tag) => tag.default) ?? false,
        );
        if (defaultImage) {
          const values = {
            image: defaultImage.name,
            tag: defaultImage.tags?.find((tag) => tag.default)?.name ?? '',
          };
          setSelectedImageTag(values);
          postChange(`${values.image}:${values.tag}`);
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [selectedImageTag, imageList]);

  const handleSelection = (image: ImageType, tag: string, checked: boolean) => {
    if (checked) {
      setSelectedImageTag({ image: image.name, tag });
      postChange(`${image.name}:${tag}`);
    }
  };

  return (
    <div className="jsp-spawner__option-section m-is-top">
      <div className="jsp-spawner__option-section__title">Notebook image</div>
      {imageList?.find((image) => isImageBuildInProgress(image)) ? (
        <Alert isInline title="Additional Notebook images installing">
          Installation of all Notebook images can take up to 40 minutes. each image becomes
          available ot select once its installation completes.
          {ABOUT_NOTEBOOK_IMAGES_LINK ? (
            <div className="jsp-spawner__option-section__learn-more">
              <a href={ABOUT_NOTEBOOK_IMAGES_LINK} target="_blank" rel="noopener noreferrer">
                Learn more about predefined Notebook images
                <ExternalLinkAltIcon />
              </a>
            </div>
          ) : null}
        </Alert>
      ) : null}
      <div className="jsp-spawner__image-options">
        <div className="jsp-spawner__image-options__group">
          {imageList
            ? imageList?.map((image, index) =>
                index < Math.ceil(imageList.length / 2) ? (
                  <ImageSelector
                    key={image.name}
                    image={image}
                    selectedImage={selectedImageTag?.image}
                    selectedTag={selectedImageTag?.tag}
                    handleSelection={handleSelection}
                  />
                ) : null,
              )
            : null}
        </div>
        <div className="jsp-spawner__image-options__group">
          {imageList
            ? imageList?.map((image, index) =>
                index >= Math.ceil(imageList.length / 2) ? (
                  <ImageSelector
                    key={image.name}
                    image={image}
                    selectedImage={selectedImageTag?.image}
                    selectedTag={selectedImageTag?.tag}
                    handleSelection={handleSelection}
                  />
                ) : null,
              )
            : null}
        </div>
      </div>
    </div>
  );
};

export default ImageForm;
