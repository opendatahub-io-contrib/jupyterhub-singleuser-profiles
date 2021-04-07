import * as React from 'react';
import { Button, ButtonVariant, Popover, Radio } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon, ExternalLinkAltIcon } from '@patternfly/react-icons';
import { APIGet, APIPost } from '../utils/APICalls';
import { CM_PATH, DEFAULT_IMAGE_PATH, IMAGE_PATH } from '../utils/const';
import { UserConfigMapType } from '../utils/types';

import './ImageForm.scss';

const ImageForm: React.FC = () => {
  const [selectedValue, setSelectedValue] = React.useState<string>();
  const [imageList, setImageList] = React.useState<string[]>();

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
    APIGet(IMAGE_PATH).then((data: string[]) => {
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

    if (selectedValue && imageList.includes(selectedValue)) {
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

  // TODO: Update Image response to include the description and requirments
  const getImagePopover = (image) => {
    if (!image.requirements) {
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
            {image.requirements.map((requirement) => (
              <span
                key={requirement}
                className="jsp-spawner__image-options__packages-popover__package"
              >
                {requirement}
              </span>
            ))}
            <Button variant={ButtonVariant.link}>
              <span className="jsp-spawner__image-options__packages-popover__link-text">
                Learn more about preinstalled packages
              </span>
              <ExternalLinkAltIcon className="jsp-spawner__image-options__packages-popover__link-icon" />
            </Button>
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
        key={image}
        id={image}
        name={image}
        className="jsp-spawner__image-options__option"
        label={
          <span className="jsp-spawner__image-options__title">
            {image}
            {getImagePopover(image)}
          </span>
        }
        description={image.description}
        isChecked={image === selectedValue}
        onChange={(checked: boolean) => handleSelection(image, checked)}
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
