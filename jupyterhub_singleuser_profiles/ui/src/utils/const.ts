export const DEV_MODE = process.env.APP_ENV === 'development';
export const DEV_SERVER = process.env.DEV_SERVER || '';
export const MOCK_MODE = process.env.MOCK_MODE === 'true';
export const ABOUT_NOTEBOOK_IMAGES_LINK = process.env.ABOUT_NOTEBOOK_IMAGES_LINK || '';
export const POLL_INTERVAL = process.env.POLL_INTERVAL
  ? parseInt(process.env.POLL_INTERVAL)
  : 30000;
export const USER_MANAGEMENT_URL = process.env.USER_MANAGEMENT_URL || '';
export const PRODUCT_NAME = process.env.PRODUCT_NAME || 'Open Data Hub';

export const API_BASE_PATH = '/services/jsp-api/api/';
export const CM_PATH = 'user/configmap';
export const SIZES_PATH = 'sizes';
export const IMAGE_PATH = 'images';
export const DEFAULT_IMAGE_PATH = 'images/default';
export const UI_CONFIG_PATH = 'ui/config';
export const SINGLE_SIZE_PATH = 'size';

export const HUB_PATH = '/hub/api';
export const USERS_PATH = 'users';
export const SHUTDOWN_PATH = 'shutdown';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const jhData = window.jhdata as { user: string; for_user: string };
export const USER = DEV_MODE ? 'DevUser' : jhData?.user ?? '';
export const FOR_USER = DEV_MODE ? process.env.FOR_USER || '' : jhData?.for_user ?? '';
