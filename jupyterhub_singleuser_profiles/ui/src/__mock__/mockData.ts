import { CM_PATH, SIZES_PATH, IMAGE_PATH, SINGLE_SIZE_PATH, UI_CONFIG_PATH } from '../utils/const';
import { ImageType, SizeDescription, UiConfigType, UserConfigMapType } from '../utils/types';

type MockDataType = {
  [CM_PATH]: UserConfigMapType;
  [SIZES_PATH]: string[];
  [IMAGE_PATH]: ImageType[];
  ['size/Small']: SizeDescription;
  ['size/Medium']: SizeDescription;
  ['size/Large']: SizeDescription;
  [UI_CONFIG_PATH]: UiConfigType;
};

export const mockData: MockDataType = {
  [CM_PATH]: {
    env: [],
    gpu: 0,
    last_selected_image: 's2i-spark-minimal-notebook:py36-spark2.4.5-hadoop2.7.3',
    last_selected_size: 'Default',
  },
  [SIZES_PATH]: ['Small', 'Medium', 'Large'],
  [IMAGE_PATH]: [
    {
      description:
        'Jupyter notebook image with a set of data science libraries that advanced AI/ML notebooks will use as a base image to provide a standard for libraries avialable in all notebooks',
      url: 'https://github.com/thoth-station/s2i-generic-data-science-notebook',
      display_name: 'Standard Data Science',
      name: 's2i-generic-data-science-notebook:v0.0.3',
      content: {
        software: [
          {
            name: 'Python',
            version: 'v3.8.3',
          },
        ],
        dependencies: [
          {
            name: 'Boto3',
            version: '1.17.11',
          },
          {
            name: 'Kafka-Python',
            version: '2.0.2',
          },
          {
            name: 'Matplotlib',
            version: '3.1.3',
          },
          {
            name: 'Numpy',
            version: '1.20.2',
          },
          {
            name: 'Pandas',
            version: '1.2.3',
          },
          {
            name: 'Scipy',
            version: '1.6.2',
          },
        ],
      },
    },
  ],
  ['size/Small']: {
    name: 'Small',
    resources: {
      limits: {
        cpu: 2,
        memory: '2Gi',
      },
      requests: {
        cpu: 1,
        memory: '1Gi',
      },
    },
  },
  ['size/Medium']: {
    name: 'Medium',
    resources: {
      limits: {
        cpu: 4,
        memory: '4Gi',
      },
      requests: {
        cpu: 2,
        memory: '2Gi',
      },
    },
  },
  ['size/Large']: {
    name: 'Large',
    resources: {
      limits: {
        cpu: 8,
        memory: '8Gi',
      },
      requests: {
        cpu: 4,
        memory: '4Gi',
      },
    },
  },
  [UI_CONFIG_PATH]: {
    envVarConfig: {
      categories: [
        {
          name: 'AWS',
          variables: [
            {
              name: 'AWS_BLAH',
              type: 'password',
            },
          ],
        },
      ],
      enabled: true,
    },
    gpuConfig: {
      enabled: true,
      gpuDropdown: {
        end: 3,
        start: 0,
      },
      type: 'dropdown',
    },
    sizeConfig: {
      enabled: true,
    },
  },
};
