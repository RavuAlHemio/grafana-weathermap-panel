const baseWebpackConfigs = require('./webpack.config');
const TerserPlugin = require('terser-webpack-plugin');

var confs = baseWebpackConfigs;

for (let conf of confs) {
  conf.mode = 'production';

  conf.optimization = {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        sourceMap: true,
      }),
    ],
  };
}

module.exports = confs;
