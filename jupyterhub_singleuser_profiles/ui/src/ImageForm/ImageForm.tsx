import * as React from 'react';
import { Radio } from '@patternfly/react-core';
import { APIGet, APIPost } from '../utils/APICalls';
import { CM_PATH, DEFAULT_IMAGE_PATH, IMAGE_PATH } from '../utils/const';
import { ImageType, UserConfigMapType, UiConfigType, ImageTagType } from '../utils/types';
import ImageVersions from './ImageVersions';
import { getDescriptionForTag } from './imageUtils';
import ImageTagPopover from './ImageTagPopover';

import './ImageForm.scss';

type ImageFormProps = {
  uiConfig: UiConfigType;
};

const getValuesFromImageName = (imageName: string): { image: string; tag: string } => {
  const index = imageName?.indexOf(':');
  return {
    image: index > 0 ? imageName.slice(0, index) : imageName,
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
    const currentTag = currentImage?.tags.find((tag) => tag.name === selectedImageTag.tag);
    if (currentImage && currentTag) {
      return;
    }

    // Fetch the defaults and use them
    APIGet(DEFAULT_IMAGE_PATH).then((data: string) => {
      if (!cancelled && data) {
        const values = getValuesFromImageName(data);
        if (values.image && values.tag) {
          setSelectedImageTag(values);
          postChange(data);
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [selectedImageTag, imageList]);

  const getDefaultTag = (image: ImageType): ImageTagType => {
    if (image?.tags.length > 1) {
      const defaultTag = image.tags.find((tag) => tag.recommended);
      if (defaultTag) {
        return defaultTag;
      }
    }
    return image.tags[0];
  };

  const handleSelection = (image: ImageType, tag: string, checked: boolean) => {
    if (checked) {
      if (image.name !== selectedImageTag?.image) {
        setSelectedImageTag({ image: image.name, tag: getDefaultTag(image).name });
      } else {
        setSelectedImageTag({ image: image.name, tag });
      }
      postChange(`${image}:${tag}`);
    }
  };

  const getTagForImage = (image: ImageType): ImageTagType => {
    let tag;
    if (image.tags.length > 1) {
      if (image.name === selectedImageTag?.image && selectedImageTag?.tag) {
        tag = image.tags.find((tag) => tag.name === selectedImageTag?.tag);
      } else {
        tag = getDefaultTag(image);
      }
    }
    return tag || image.tags[0];
  };

  const getImageTagVersion = (image: ImageType): string => {
    if (image?.tags.length > 1) {
      const defaultTag = getDefaultTag(image);
      if (image.name === selectedImageTag?.image && selectedImageTag?.tag) {
        return `${selectedImageTag?.tag} ${
          selectedImageTag?.tag === defaultTag?.name ? ' (default)' : ''
        }`;
      }
      return defaultTag?.name ?? image.tags[0].name;
    }
    return '';
  };

  const getImagePopover = (image: ImageType) => {
    const tag = getTagForImage(image);
    if (!tag?.content?.dependencies?.length) {
      return null;
    }
    return <ImageTagPopover tag={tag} />;
  };

  const selectOptions =
    imageList?.map((image) => (
      <div key={image.name}>
        <Radio
          id={image.name}
          name={image.display_name}
          className="jsp-spawner__image-options__option"
          label={
            <span className="jsp-spawner__image-options__title">
              {image.display_name}
              {image.tags.length > 1 ? (
                <span className="jsp-spawner__image-options__title-version">
                  {getImageTagVersion(image)}
                </span>
              ) : null}
              {getImagePopover(image)}
            </span>
          }
          description={getDescriptionForTag(getTagForImage(image))}
          isChecked={image.name === selectedImageTag?.image}
          onChange={(checked: boolean) => handleSelection(image, '', checked)}
        />
        <ImageVersions
          image={image}
          selectedTag={image.name === selectedImageTag?.image ? selectedImageTag.tag : ''}
          onSelect={(tagName, checked) => handleSelection(image, tagName, checked)}
        />
      </div>
    )) ?? [];

  return (
    <div className="jsp-spawner__option-section">
      <div className="jsp-spawner__option-section__title">Notebook image</div>
      <div className="jsp-spawner__image-options">{selectOptions}</div>
    </div>
  );
};

export default ImageForm;
