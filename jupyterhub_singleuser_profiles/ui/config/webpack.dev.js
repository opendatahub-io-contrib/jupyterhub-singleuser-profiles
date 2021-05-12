const path = require('path');
const { merge } = require('webpack-merge');
const { setupWebpackDotenvFilesForEnv, setupDotenvFilesForEnv } = require('./dotenv');

setupDotenvFilesForEnv({ env: 'development' });
const webpackCommon = require('./webpack.common.js');

const RELATIVE_DIRNAME = process.env._JSP_RELATIVE_DIRNAME;
const SRC_DIR = process.env._JSP_SRC_DIR;
const DIST_DIR = process.env._JSP_DIST_DIR;
const HOST = process.env._JSP_HOST;
const PORT = process.env._JSP_PORT;

module.exports = merge(
  {
    plugins: [
      ...setupWebpackDotenvFilesForEnv({ directory: RELATIVE_DIRNAME, env: 'development' })
    ]
  },
  webpackCommon('development'),
  {
    mode: 'development',
    devtool: 'eval-source-map',
    devServer: {
      contentBase: DIST_DIR,
      host: HOST,
      port: PORT,
      compress: true,
      inline: true,
      historyApiFallback: true,
      hot: true,
      overlay: true,
      open: true,
      stats: 'errors-only'
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          include: [
            SRC_DIR,
            path.resolve(RELATIVE_DIRNAME, 'node_modules/patternfly'),
            path.resolve(RELATIVE_DIRNAME, 'node_modules/@patternfly/patternfly'),
            path.resolve(RELATIVE_DIRNAME, 'node_modules/@patternfly/react-catalog-view-extension'),
            path.resolve(RELATIVE_DIRNAME, 'node_modules/@patternfly/react-core/dist/styles/base.css'),
            path.resolve(RELATIVE_DIRNAME, 'node_modules/@patternfly/react-core/dist/esm/@patternfly/patternfly'),
            path.resolve(RELATIVE_DIRNAME, 'node_modules/@cloudmosaic/quickstarts')
          ],
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.css$/,
          include: stylesheet => stylesheet.includes('@patternfly/react-styles/css/'),
          use: ['null-loader']
        }
      ]
    }
  }
);
