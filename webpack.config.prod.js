const baseWebpackConfigs = require('./webpack.config');
const ngAnnotatePlugin = require('ng-annotate-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

var confs = baseWebpackConfigs;

for (let conf of confs) {
  conf.mode = 'production';

  conf.plugins.push(new ngAnnotatePlugin());
  conf.plugins.push(
    new UglifyJSPlugin({
      sourceMap: true,
    })
  );
}

module.exports = confs;
