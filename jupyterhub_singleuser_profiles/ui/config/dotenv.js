const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const Dotenv = require('dotenv-webpack');

/**
 * Return tsconfig compilerOptions.
 *
 * @param {string} directory
 * @returns {object}
 */
const getTsCompilerOptions = directory => {
  const tsconfigFile = path.resolve(directory, './tsconfig.json');
  let tsCompilerOptions = {};

  if (fs.existsSync(tsconfigFile)) {
    const { compilerOptions = { outDir: './dist', baseUrl: './src' } } = require(tsconfigFile);
    tsCompilerOptions = compilerOptions;
  }

  return tsCompilerOptions;
};

/**
 * Setup a webpack dotenv plugin config.
 *
 * @param {string} path
 * @returns {*}
 */
const setupWebpackDotenvFile = path => {
  const settings = {
    systemvars: true,
    silent: true
  };

  if (path) {
    settings.path = path;
  }

  return new Dotenv(settings);
};

/**
 * Setup multiple webpack dotenv file parameters.
 *
 * @param {string} directory
 * @param {string} env
 * @param {boolean} isRoot
 * @returns {Array}
 */
const setupWebpackDotenvFilesForEnv = ({ directory, env }) => {
  const dotenvWebpackSettings = [];

  if (env) {
    dotenvWebpackSettings.push(setupWebpackDotenvFile(path.resolve(directory, `.env.${env}.local`)));
    dotenvWebpackSettings.push(setupWebpackDotenvFile(path.resolve(directory, `.env.${env}`)));
  }

  dotenvWebpackSettings.push(setupWebpackDotenvFile(path.resolve(directory, '.env.local')));
  dotenvWebpackSettings.push(setupWebpackDotenvFile(path.resolve(directory, '.env')));

  return dotenvWebpackSettings;
};

/**
 * Setup, and access, a dotenv file and the related set of parameters.
 *
 * @param {string} path
 * @returns {*}
 */
const setupDotenvFile = path => {
  const dotenvInitial = dotenv.config({ path });
  dotenvExpand(dotenvInitial);
};

/**
 * Setup and access local and specific dotenv file parameters.
 *
 * @param {string} env
 */
const setupDotenvFilesForEnv = ({ env }) => {
  const RELATIVE_DIRNAME = path.resolve(__dirname, '..');
  const { baseUrl: TS_BASE_URL, outDir: TS_OUT_DIR } = getTsCompilerOptions(RELATIVE_DIRNAME);

  if (env) {
    setupDotenvFile(path.resolve(RELATIVE_DIRNAME, `.env.${env}.local`));
    setupDotenvFile(path.resolve(RELATIVE_DIRNAME, `.env.${env}`));
  }

  setupDotenvFile(path.resolve(RELATIVE_DIRNAME, '.env.local'));
  setupDotenvFile(path.resolve(RELATIVE_DIRNAME, '.env'));

  const IMAGES_DIRNAME = process.env.JSP_IMAGES_DIRNAME || 'images';
  const PUBLIC_PATH = process.env.JSP_PUBLIC_PATH || '/hub/static/jsp-ui/';
  const SRC_DIR = path.resolve(RELATIVE_DIRNAME, process.env.JSP_SRC_DIR || TS_BASE_URL || 'src');
  const DIST_DIR = path.resolve(RELATIVE_DIRNAME, process.env.JSP_DIST_DIR || TS_OUT_DIR || 'dist');
  const HOST = process.env.JSP_HOST || 'localhost';
  const PORT = process.env.JSP_PORT || '7000';
  const OUTPUT_ONLY = process.env._JSP_OUTPUT_ONLY === 'true';

  process.env._JSP_RELATIVE_DIRNAME = RELATIVE_DIRNAME;
  process.env._JSP_IMAGES_DIRNAME = IMAGES_DIRNAME;
  process.env._JSP_PUBLIC_PATH = PUBLIC_PATH;
  process.env._JSP_SRC_DIR = SRC_DIR;
  process.env._JSP_DIST_DIR = DIST_DIR;
  process.env._JSP_HOST = HOST;
  process.env._JSP_PORT = PORT;
  process.env._JSP_OUTPUT_ONLY = OUTPUT_ONLY;
};

module.exports = { setupWebpackDotenvFilesForEnv, setupDotenvFilesForEnv };
