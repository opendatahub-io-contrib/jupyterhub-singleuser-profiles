import * as React from 'react';
import { Radio } from '@patternfly/react-core';
import { ImageType } from '../utils/types';
import { getDescriptionForTag, getImageTagVersion, getTagForImage } from './imageUtils';
import ImageTagPopover from './ImageTagPopover';
import ImageVersions from './ImageVersions';

type ImageSelectorProps = {
  image: ImageType;
  selectedImage?: string;
  selectedTag?: string;
  handleSelection: (image: ImageType, tag: string, checked: boolean) => void;
};

const ImageSelector: React.FC<ImageSelectorProps> = ({
  image,
  selectedImage,
  selectedTag,
  handleSelection,
}) => {
  const currentTag = getTagForImage(image, selectedImage, selectedTag);

  const getImagePopover = (image: ImageType) => {
    if (!image.description && !currentTag?.content?.dependencies?.length) {
      return null;
    }
    return <ImageTagPopover tag={currentTag} description={image.description || undefined} />;
  };

  return (
    <div className="jsp-spawner__image-options__image">
      <Radio
        id={image.name}
        name={image.display_name}
        className="jsp-spawner__image-options__option"
        label={
          <span className="jsp-spawner__image-options__title">
            {image.display_name}
            {image.tags.length > 1 ? (
              <span className="jsp-spawner__image-options__title-version">
                {getImageTagVersion(image, selectedImage, selectedTag)}
              </span>
            ) : null}
            {getImagePopover(image)}
          </span>
        }
        description={getDescriptionForTag(currentTag)}
        isChecked={image.name === selectedImage}
        onChange={(checked: boolean) => handleSelection(image, currentTag.name, checked)}
      />
      <ImageVersions
        image={image}
        selectedTag={image.name === selectedImage ? selectedTag : ''}
        onSelect={(tagName, checked) => handleSelection(image, tagName, checked)}
      />
    </div>
  );
};

export default ImageSelector;
