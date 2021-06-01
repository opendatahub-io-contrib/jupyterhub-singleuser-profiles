import * as React from 'react';
import { Popover, Radio } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { APIGet, APIPost } from '../utils/APICalls';
import { CM_PATH, DEFAULT_IMAGE_PATH, IMAGE_PATH } from '../utils/const';
import { ImageType, ImageSoftwareType, UserConfigMapType, UiConfigType } from '../utils/types';

import './ImageForm.scss';

type ImageFormProps = {
  uiConfig: UiConfigType;
};

const ImageForm: React.FC<ImageFormProps> = ({ uiConfig }) => {
  const [selectedValue, setSelectedValue] = React.useState<string>();
  const [imageList, setImageList] = React.useState<ImageType[]>();

  const postChange = (text) => {
    const json = JSON.stringify({ last_selected_image: text });
    APIPost(CM_PATH, json);
  };

  React.useEffect(() => {
    let cancelled = false;
    APIGet(CM_PATH).then((data: UserConfigMapType) => {
      if (!cancelled) {
        setSelectedValue(data['last_selected_image'] || '');
      }
    });
    APIGet(IMAGE_PATH).then((data: ImageType[]) => {
      if (!cancelled) {
        setImageList(data);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    if (!imageList || selectedValue === undefined) {
      return;
    }

    if (selectedValue && imageList.find((image) => image.name === selectedValue)) {
      return;
    }

    APIGet(DEFAULT_IMAGE_PATH).then((data: string) => {
      if (!cancelled) {
        setSelectedValue(data);
        postChange(data);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [selectedValue, imageList]);

  const handleSelection = (image: string, checked: boolean) => {
    if (checked) {
      setSelectedValue(image);
      postChange(image);
    }
  };

  const getNameVersionString = (software: ImageSoftwareType): string => {
    const versionString = software?.version ? ` ${software?.version}` : '';
    return `${software.name}${versionString}`;
  };

  const getDescriptionForImage = (image: ImageType): string => {
    const softwareDescriptions = image.content.software.map((software) =>
      getNameVersionString(software),
    );
    return softwareDescriptions.join(', ');
  };

  const getImagePopover = (image) => {
    if (!image.content?.dependencies?.length) {
      return null;
    }
    return (
      <Popover
        className="jsp-spawner__image-options__packages-popover"
        showClose
        bodyContent={
          <>
            <span className="jsp-spawner__image-options__packages-popover__title">
              Packages included:
            </span>
            {image.content.dependencies.map((dependency) => (
              <span
                key={dependency.name}
                className="jsp-spawner__image-options__packages-popover__package"
              >
                {getNameVersionString(dependency)}
              </span>
            ))}
          </>
        }
      >
        <OutlinedQuestionCircleIcon />
      </Popover>
    );
  };

  const selectOptions =
    imageList?.map((image) => (
      <Radio
        key={image.name}
        id={image.name}
        name={image.display_name}
        className="jsp-spawner__image-options__option"
        label={
          <span className="jsp-spawner__image-options__title">
            {image.display_name}
            {getImagePopover(image)}
          </span>
        }
        description={getDescriptionForImage(image)}
        isChecked={image.name === selectedValue}
        onChange={(checked: boolean) => handleSelection(image.name, checked)}
      />
    )) ?? [];

  return (
    <div className="jsp-spawner__option-section">
      <div className="jsp-spawner__option-section__title">Notebook image</div>
      <div className="jsp-spawner__image-options">{selectOptions}</div>
    </div>
  );
};

export default ImageForm;
