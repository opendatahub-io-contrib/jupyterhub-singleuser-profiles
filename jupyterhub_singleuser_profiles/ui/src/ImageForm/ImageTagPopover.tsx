import * as React from 'react';
import { Popover } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { ImageTagType } from '../utils/types';
import { getNameVersionString } from './imageUtils';

type ImageTagPopoverProps = {
  tag: ImageTagType;
};

const ImageTagPopover: React.FC<ImageTagPopoverProps> = ({ tag }) => (
  <Popover
    className="jsp-spawner__image-options__packages-popover"
    showClose
    bodyContent={
      <>
        <span className="jsp-spawner__image-options__packages-popover__title">
          Packages included:
        </span>
        {tag.content.dependencies.map((dependency) => (
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

export default ImageTagPopover;
