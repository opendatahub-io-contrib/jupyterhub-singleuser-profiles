import * as React from 'react';
import * as _ from 'lodash';
import { IMAGE_PATH, POLL_INTERVAL } from './const';
import { ImageType } from './types';
import { APIGet } from './APICalls';

export const useWatchImages = (): ImageType[] | undefined => {
  const [images, setImages] = React.useState<ImageType[]>();
  const prevResults = React.useRef<ImageType[]>();

  React.useEffect(() => {
    let watchHandle;
    const fetchImages = () => {
      APIGet(IMAGE_PATH)
        .then((data: ImageType[]) => {
          if (!_.isEqual(data, prevResults.current)) {
            setImages(data);
            prevResults.current = data;
          }
        })
        .catch(() => {
          // ignore
        });
      watchHandle = setTimeout(fetchImages, POLL_INTERVAL);
    };
    fetchImages();

    return () => {
      if (watchHandle) {
        clearTimeout(watchHandle);
      }
    };
  }, []);

  return images;
};
