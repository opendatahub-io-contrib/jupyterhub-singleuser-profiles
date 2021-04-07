import { CM_PATH, SIZES_PATH, IMAGE_PATH, SINGLE_SIZE_PATH } from '../utils/const';

export const mockData = {
  [CM_PATH]: {
    env: [
      {
        name: 'AWS_ACCESS_KEY_ID',
        type: 'password',
        value: 'ssd',
      },
      {
        name: 'AWS_SECRET_ACCESS_KEY',
        type: 'password',
        value: 'ddd',
      },
      {
        name: 'eeeeee',
        type: 'text',
        value: 'asdasfa',
      },
    ],
    gpu: 0,
    last_selected_image: 's2i-spark-minimal-notebook:py36-spark2.4.5-hadoop2.7.3',
    last_selected_size: 'Default',
  },
  [SIZES_PATH]: ['Small', 'Medium', 'Large'],
  [IMAGE_PATH]: [
    's2i-lab-elyra:v0.0.6',
    's2i-minimal-notebook:v0.0.7',
    's2i-scipy-notebook:v0.0.2',
    's2i-spark-minimal-notebook:py36-spark2.4.5-hadoop2.7.3',
    's2i-spark-scipy-notebook:3.6',
    's2i-tensorflow-notebook:v0.0.2',
  ],
  [`${SINGLE_SIZE_PATH}/Small`]: {
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
  [`${SINGLE_SIZE_PATH}/Medium`]: {
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
  [`${SINGLE_SIZE_PATH}/Large`]: {
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
};
