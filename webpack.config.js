const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = [
  // Grafana plugin
  {
    context: path.join(__dirname, 'src'),
    entry: {
      module: './module.ts',
    },
    devtool: 'source-map',
    output: {
      filename: '[name].js',
      path: path.join(__dirname, 'dist'),
      libraryTarget: 'amd',
    },
    externals: [
      'lodash',
      'moment',
      ({context, request}, callback) => {
        var prefix = 'grafana/';
        if (request.indexOf(prefix) === 0) {
          return callback(null, request.substr(prefix.length));
        }
        callback();
      },
    ],
    plugins: [
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: [
          "dist",
        ],
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'plugin.json', to: '.' },
          { from: '../README.md', to: '.' },
          { from: 'partials/*', to: '.' },
          { from: 'img/*', to: '.' },
        ]
      }),
    ],
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env'],
                plugins: ["angularjs-annotate"],
              },
            },
            'ts-loader',
          ],
          exclude: /(node_modules)/,
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: 'style-loader',
            },
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                sourceMap: true,
              },
            },
          ],
        },
      ],
    },
  },

  // genwmap standalone tool
  {
    context: path.join(__dirname, 'src'),
    entry: {
      genwmap: './genwmap/index.js',
    },
    devtool: 'source-map',
    output: {
      filename: '[name].js',
      path: path.join(__dirname, 'dist'),
    },
    target: 'node',
    plugins: [],
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            'ts-loader',
          ],
          exclude: /(node_modules)/,
        },
      ],
    },
  },
];
