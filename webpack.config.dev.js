const baseWebpackConfigs = require('./webpack.config');

var confs = baseWebpackConfigs;
for (let conf of confs) {
    conf.mode = 'development';
    conf.devtool = 'inline-source-map';
}

module.exports = confs;
