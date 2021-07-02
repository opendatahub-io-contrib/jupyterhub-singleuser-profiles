export const DEV_MODE = process.env.APP_ENV === 'development';
export const DEV_SERVER = process.env.DEV_SERVER || '';
export const MOCK_MODE = process.env.MOCK_MODE === 'true';
export const ABOUT_NOTEBOOK_IMAGES_LINK = process.env.ABOUT_NOTEBOOK_IMAGES_LINK || '';

export const API_BASE_PATH = '/services/jsp-api/api/';
export const CM_PATH = 'user/configmap';
export const SIZES_PATH = 'sizes';
export const IMAGE_PATH = 'images';
export const DEFAULT_IMAGE_PATH = 'images/default';
export const UI_CONFIG_PATH = 'ui/config';
export const SINGLE_SIZE_PATH = 'size';
