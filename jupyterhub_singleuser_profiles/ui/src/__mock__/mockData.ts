import {
  CM_PATH,
  SIZES_PATH,
  IMAGE_PATH,
  UI_CONFIG_PATH,
  DEFAULT_IMAGE_PATH,
  USERS_PATH,
} from '../utils/const';
import {
  ImageType,
  JHUser,
  SizeDescription,
  UiConfigType,
  UserConfigMapType,
} from '../utils/types';

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
  ['server/progress']: { status: number };
  [USERS_PATH]: {
    json: () => Promise<JHUser[]>;
  };
};

const setFauxDate = (index: number): string | null => {
  if (index % 12 === 0) {
    return null;
  }
  const now = new Date();
  now.setTime(now.getTime() - index * 90 * 1000);
  return now.toISOString();
};

export const mockData: MockDataType = {
  [CM_PATH]: {
    env: [],
    gpu: 0,
    last_selected_image: 's2i-generic-data-science-notebook:v0.0.24',
    last_selected_size: 'Large',
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
      created_by: null,
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
      created_by: null,
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
      created_by: null,
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
      created_by: null,
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
      created_by: null,
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
      created_by: null,
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
      created_by: null,
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
      created_by: null,
    },
    {
      description: 'Jupyter notebook image containing dependencies for training Tensorflow models.',
      display_name: 'No Tags Notebook Image',
      name: 'no-tags-notebook',
      order: 100,
      url: 'https://github.com/thoth-station/s2i-tensorflow-notebook',
      created_by: null,
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
    schedulable: false,
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
  ['server/progress']: {
    status: 400,
  },
  [USERS_PATH]: {
    json: (): Promise<JHUser[]> => {
      const users: JHUser[] = [];
      for (let i = 0; i < 100; i++) {
        users.push({
          admin: i % 4 === 0,
          created: '2021-10-01T11:05:33.330975Z',
          last_activity: setFauxDate(i),
          name: `User ${i}`,
          pending: i % 13 === 0 ? (i % 2 === 0 ? 'spawn' : 'stop') : '',
          server: i % 3 === 0 ? 'default' : '',
        });
      }
      return Promise.resolve(users);
    },
  },
};

type SpawnUpdate = {
  progress: number;
  message: string;
  failed: boolean;
  ready: boolean;
};

export const MOCK_SPAWN_MESSAGES: SpawnUpdate[] = [
  {
    progress: 0,
    message: 'Server requested',
    failed: false,
    ready: false,
  },
  {
    progress: 10,
    message:
      '2021-07-29T14:17:15.651297Z [Normal] Successfully assigned redhat-ods-applications/jupyterhub-nb-rhodsadmin to ip-10-0-208-112.ec2.internal',
    failed: false,
    ready: false,
  },
  {
    progress: 20,
    message:
      '2021-07-29T14:17:20Z [Normal] AttachVolume.Attach succeeded for volume "pvc-e7d9d2f6-2036-4c6b-a760-9c1d60010996"',
    failed: false,
    ready: false,
  },
  {
    progress: 30,
    message:
      '2021-07-29T14:17:20Z [Normal] AttachVolume.Attach succeeded for volume "pvc-e7d9d2f6-2036-4c6b-a760-9c1d60010996"',
    failed: false,
    ready: false,
  },
  {
    progress: 40,
    message:
      '2021-07-29T14:17:20Z [Normal] AttachVolume.Attach succeeded for volume "pvc-e7d9d2f6-2036-4c6b-a760-9c1d60010996"',
    failed: false,
    ready: false,
  },
  {
    progress: 50,
    message:
      '2021-07-29T14:17:20Z [Normal] AttachVolume.Attach succeeded for volume "pvc-e7d9d2f6-2036-4c6b-a760-9c1d60010996"',
    failed: false,
    ready: false,
  },
  {
    progress: 60,
    message:
      '2021-07-29T14:17:20Z [Normal] AttachVolume.Attach succeeded for volume "pvc-e7d9d2f6-2036-4c6b-a760-9c1d60010996"',
    failed: false,
    ready: false,
  },
  {
    progress: 70,
    message:
      '2021-07-29T14:17:20Z [Normal] AttachVolume.Attach succeeded for volume "pvc-e7d9d2f6-2036-4c6b-a760-9c1d60010996"',
    failed: false,
    ready: false,
  },
  {
    progress: 80,
    message:
      '2021-07-29T14:17:20Z [Normal] AttachVolume.Attach succeeded for volume "pvc-e7d9d2f6-2036-4c6b-a760-9c1d60010996"',
    failed: false,
    ready: false,
  },
  {
    progress: 90,
    message:
      '2021-07-29T14:17:20Z [Normal] AttachVolume.Attach succeeded for volume "pvc-e7d9d2f6-2036-4c6b-a760-9c1d60010996"',
    failed: false,
    ready: false,
  },
  {
    progress: 100,
    message: 'Server request failed.',
    failed: true,
    ready: false,
  },
];

export const getMockProgress = (): EventSource => {
  // eslint-disable-next-line prefer-const
  let handle;
  let count = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MockSource: any = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
    onmessage: (event: { data: string }) => {},
    close: () => clearTimeout(handle),
  };

  handle = setInterval(() => {
    MockSource.onmessage({ data: JSON.stringify(MOCK_SPAWN_MESSAGES[count++]) });
  }, 3000);

  return MockSource as EventSource;
};
