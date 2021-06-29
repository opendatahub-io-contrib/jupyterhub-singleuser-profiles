import { ImageSoftwareType, ImageTagType } from '../utils/types';

export const getNameVersionString = (software: ImageSoftwareType): string =>
  `${software.name}${software.version ?? ''}`;

export const getDescriptionForTag = (imageTag: ImageTagType): string => {
  const softwareDescriptions = imageTag.content.software.map((software) =>
    getNameVersionString(software),
  );
  return softwareDescriptions.join(', ');
};
