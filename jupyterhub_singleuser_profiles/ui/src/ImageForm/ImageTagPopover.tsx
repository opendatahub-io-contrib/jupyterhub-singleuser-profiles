import * as React from 'react';
import { Popover } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { ImageTagType } from '../utils/types';
import { getNameVersionString } from './imageUtils';

type ImageTagPopoverProps = {
  tag?: ImageTagType;
  description?: string;
};

const ImageTagPopover: React.FC<ImageTagPopoverProps> = ({ tag, description }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const dependencies = tag?.content?.dependencies ?? [];
  if (!description && !dependencies.length) {
    return null;
  }
  return (
    <Popover
      className="jsp-spawner__image-options__packages-popover"
      isVisible={isVisible}
      shouldOpen={(show, event) => {
        event?.preventDefault();
        setIsVisible(true);
      }}
      shouldClose={(tip, show, event) => {
        event?.preventDefault();
        setIsVisible(false);
      }}
      showClose
      bodyContent={
        <>
          {description ? (
            <span className="jsp-spawner__image-options__packages-popover__title">
              {description}
            </span>
          ) : null}
          {dependencies.length > 0 ? (
            <>
              <span className="jsp-spawner__image-options__packages-popover__package-title">
                Packages included:
              </span>
              {dependencies.map((dependency) => (
                <span
                  key={dependency.name}
                  className="jsp-spawner__image-options__packages-popover__package"
                >
                  {getNameVersionString(dependency)}
                </span>
              ))}
            </>
          ) : null}
        </>
      }
    >
      <OutlinedQuestionCircleIcon />
    </Popover>
  );
};

export default ImageTagPopover;
