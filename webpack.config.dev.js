const baseWebpackConfigs = require('./webpack.config');
const ngAnnotatePlugin = require('ng-annotate-webpack-plugin');

var confs = baseWebpackConfigs;
for (let conf of confs) {
    conf.mode = 'development';
    conf.devtool = 'inline-source-map';

    conf.plugins.push(new ngAnnotatePlugin());
}

module.exports = confs;
