import { ImageSoftwareType, ImageTagType, ImageType } from '../utils/types';

const runningStatuses = ['pending', 'running', 'cancelled'];
const failedStatuses = ['error', 'failed'];

export const isImageBuildInProgress = (image: ImageType): boolean => {
  const inProgressTag = image.tags.find((tag) =>
    runningStatuses.includes(tag.build_status?.toLowerCase() ?? ''),
  );
  return !!inProgressTag;
};

export const isImageTagBuildValid = (tag: ImageTagType): boolean => {
  return (
    !runningStatuses.includes(tag.build_status?.toLowerCase() ?? '') &&
    !failedStatuses.includes(tag.build_status?.toLowerCase() ?? '')
  );
};

export const getVersion = (version?: string, prefix?: string): string => {
  if (!version) {
    return '';
  }
  const versionString =
    version.startsWith('v') || version.startsWith('V') ? version.slice(1) : version;

  return `${prefix ? prefix : ''}${versionString}`;
};

export const getNameVersionString = (software: ImageSoftwareType): string =>
  `${software.name}${getVersion(software.version, ' v')}`;

export const getDescriptionForTag = (imageTag: ImageTagType): string => {
  const softwareDescriptions = imageTag.content.software.map((software) =>
    getNameVersionString(software),
  );
  return softwareDescriptions.join(', ');
};

export const getDefaultTag = (image: ImageType): ImageTagType => {
  if (image?.tags.length > 1) {
    const validTags = image.tags.filter((tag) => isImageTagBuildValid(tag));
    if (validTags.length) {
      const defaultTag = validTags.find((tag) => tag.recommended);
      if (defaultTag) {
        return defaultTag;
      }
      return validTags[0];
    }
    const defaultTag = image.tags.find((tag) => tag.recommended);
    if (defaultTag) {
      return defaultTag;
    }
  }
  return image.tags[0];
};

export const getTagForImage = (
  image: ImageType,
  selectedImage?: string,
  selectedTag?: string,
): ImageTagType => {
  let tag;
  if (image.tags.length > 1) {
    if (image.name === selectedImage && selectedTag) {
      tag = image.tags.find((tag) => tag.name === selectedTag);
    } else {
      tag = getDefaultTag(image);
    }
  }
  return tag || image.tags[0];
};

export const getImageTagVersion = (
  image: ImageType,
  selectedImage?: string,
  selectedTag?: string,
): string => {
  if (image?.tags.length > 1) {
    const defaultTag = getDefaultTag(image);
    if (image.name === selectedImage && selectedTag) {
      return `${selectedTag} ${selectedTag === defaultTag?.name ? ' (default)' : ''}`;
    }
    return defaultTag?.name ?? image.tags[0].name;
  }
  return '';
};
