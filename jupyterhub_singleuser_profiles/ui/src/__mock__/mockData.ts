import {
  CM_PATH,
  SIZES_PATH,
  IMAGE_PATH,
  UI_CONFIG_PATH,
  DEFAULT_IMAGE_PATH,
} from '../utils/const';
import { ImageType, SizeDescription, UiConfigType, UserConfigMapType } from '../utils/types';

type MockDataType = {
  [CM_PATH]: UserConfigMapType;
  [SIZES_PATH]: string[];
  [IMAGE_PATH]: ImageType[];
  ['size/Small']: SizeDescription;
  ['size/Medium']: SizeDescription;
  ['size/Large']: SizeDescription;
  ['size/Huge']: SizeDescription;
  [UI_CONFIG_PATH]: UiConfigType;
  [DEFAULT_IMAGE_PATH]: string;
};

export const mockData: MockDataType = {
  [CM_PATH]: {
    env: [],
    gpu: 0,
    last_selected_image: 's2i-generic-data-science-notebook:v0.0.24',
    last_selected_size: 'Default',
  },
  [DEFAULT_IMAGE_PATH]: 's2i-generic-data-science-notebook:v0.0.4',
  [SIZES_PATH]: ['Small', 'Medium', 'Large', 'Huge'],
  [IMAGE_PATH]: [
    {
      description:
        'Jupyter notebook image with a set of data science libraries that advanced AI/ML notebooks will use as a base image to provide a standard for libraries available in all notebooks',
      display_name: 'Standard Data Science',
      name: 's2i-generic-data-science-notebook',
      order: 30,
      tags: [
        {
          build_status: 'Unknown',
          content: {
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
                version: '1.20.3',
              },
              {
                name: 'Pandas',
                version: '1.2.4',
              },
              {
                name: 'Scipy',
                version: '1.6.3',
              },
            ],
            software: [
              {
                name: 'Python',
                version: 'v3.8.3',
              },
            ],
          },
          name: 'v0.0.4',
          recommended: false,
          default: true,
        },
        {
          build_status: 'Unknown',
          content: {
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
                version: '1.20.3',
              },
              {
                name: 'Pandas',
                version: '1.2.4',
              },
              {
                name: 'Scipy',
                version: '1.6.3',
              },
            ],
            software: [
              {
                name: 'Python',
                version: 'v3.8.3',
              },
            ],
          },
          name: 'v0.0.24',
          recommended: true,
          default: false,
        },
      ],
      url: 'https://github.com/thoth-station/s2i-generic-data-science-notebook',
    },
    {
      description: 'Jupyter notebook image with Elyra-AI installed',
      display_name: 'Elyra Notebook Image',
      name: 's2i-lab-elyra',
      order: 100,
      tags: [
        {
          build_status: 'Unknown',
          content: {
            dependencies: [],
            software: [
              {
                name: 'Python',
                version: 'v3.8.7',
              },
            ],
          },
          name: 'v0.0.8',
          recommended: false,
          default: false,
        },
      ],
      url: 'https://github.com/thoth-station/s2i-lab-elyra',
    },
    {
      description:
        'Jupyter notebook image with minimal dependency set to start experimenting with Jupyter environment.',
      display_name: 'Minimal Python',
      name: 's2i-minimal-notebook',
      order: 10,
      tags: [
        {
          build_status: 'Running',
          content: {
            dependencies: [
              {
                name: 'JupyterLab',
                version: '3.0.14',
              },
              {
                name: 'Notebook',
                version: '6.3.0',
              },
            ],
            software: [
              {
                name: 'Python',
                version: 'v3.8.3',
              },
            ],
          },
          name: 'v0.0.14',
          recommended: true,
          default: false,
        },
        {
          build_status: 'Unknown',
          content: {
            dependencies: [
              {
                name: 'JupyterLab',
                version: '2.2.4',
              },
              {
                name: 'Notebook',
                version: '6.2.0',
              },
            ],
            software: [
              {
                name: 'Python',
                version: 'v3.6.8',
              },
            ],
          },
          name: 'v0.0.7',
          recommended: false,
          default: false,
        },
        {
          build_status: 'Unknown',
          content: {
            dependencies: [
              {
                name: 'JupyterLab',
                version: '2.2.4',
              },
              {
                name: 'Notebook',
                version: '6.2.0',
              },
            ],
            software: [
              {
                name: 'Python',
                version: 'v3.6.8',
              },
            ],
          },
          name: 'v1.0.0',
          recommended: false,
          default: false,
        },
      ],
      url: 'https://github.com/thoth-station/s2i-minimal-notebook',
    },
    {
      description:
        'Jupyter notebook image containing basic dependencies for data science and machine learning work.',
      display_name: 'SciPy Notebook Image',
      name: 's2i-scipy-notebook',
      order: 100,
      tags: [
        {
          build_status: 'Failed',
          content: {
            dependencies: [],
            software: [
              {
                name: 'Python',
                version: 'v3.8.7',
              },
            ],
          },
          name: 'v0.0.2',
          recommended: false,
          default: false,
        },
      ],
      url: 'https://github.com/thoth-station/s2i-minimal-notebook',
    },
    {
      description: null,
      display_name: 'Minimal Python with Apache Spark',
      name: 's2i-spark-minimal-notebook',
      order: 100,
      tags: [
        {
          build_status: 'Unknown',
          content: {
            dependencies: [],
            software: [],
          },
          name: 'py36-spark2.4.5-hadoop2.7.3',
          recommended: false,
          default: false,
        },
      ],
      url: null,
    },
    {
      description: null,
      display_name: 'Minimal Python with Apache Spark and SciPy',
      name: 's2i-spark-scipy-notebook',
      order: 100,
      tags: [
        {
          build_status: 'failed',
          content: {
            dependencies: [],
            software: [
              {
                name: 'Python',
                version: 'v3.8.7',
              },
            ],
          },
          name: '3.6',
          recommended: false,
          default: false,
        },
        {
          build_status: 'pending',
          content: {
            dependencies: [],
            software: [],
          },
          name: '3.5.2',
          recommended: true,
          default: false,
        },
      ],
      url: null,
    },
    {
      description: 'Jupyter notebook image containing dependencies for training Tensorflow models.',
      display_name: 'Tensorflow Notebook Image',
      name: 's2i-tensorflow-notebook',
      order: 100,
      tags: [
        {
          build_status: 'Unknown',
          content: {
            dependencies: [],
            software: [
              {
                name: 'Python',
                version: 'v3.8.7',
              },
              {
                name: 'Tensorflow CPU',
                version: 'v2.4.0',
              },
            ],
          },
          name: 'v0.0.2',
          recommended: false,
          default: false,
        },
      ],
      url: 'https://github.com/thoth-station/s2i-tensorflow-notebook',
    },
    {
      description: 'Jupyter notebook image containing dependencies for training Tensorflow models.',
      display_name: 'No Tag Content Notebook Image',
      name: 'no-tag-content-notebook',
      order: 100,
      tags: [
        {
          build_status: 'Unknown',
          name: 'notag-3.8-badsemver-1.4.1',
          recommended: false,
          default: false,
        },
        {
          build_status: 'Unknown',
          content: {
            dependencies: [],
            software: [
              {
                name: 'Python',
                version: 'v3.8.7',
              },
              {
                name: 'Tensorflow CPU',
                version: 'v2.4.0',
              },
            ],
          },
          name: 'notag-3.8-badsemver-1.0.3',
          recommended: false,
          default: false,
        },
        {
          build_status: 'Unknown',
          name: 'v0.0.4',
          recommended: false,
          default: false,
        },
      ],
      url: 'https://github.com/thoth-station/s2i-tensorflow-notebook',
    },
    {
      description: 'Jupyter notebook image containing dependencies for training Tensorflow models.',
      display_name: 'No Tags Notebook Image',
      name: 'no-tags-notebook',
      order: 100,
      url: 'https://github.com/thoth-station/s2i-tensorflow-notebook',
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
    schedulable: true,
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
    schedulable: true,
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
  ['size/Huge']: {
    name: 'Huge',
    resources: {
      limits: {
        cpu: 16,
        memory: '18Gi',
      },
      requests: {
        cpu: 8,
        memory: '8Gi',
      },
    },
    schedulable: false,
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
