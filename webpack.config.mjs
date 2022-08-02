import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// @ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
export default {
  target: 'node',
  mode: process.env.NODE_ENV,
  experiments: {topLevelAwait: true},

  entry: './packages/enre-cli/src/index.ts',
  output: {
    path: path.resolve(__dirname, './lib'),
    filename: 'enre-ts.js'
  },
  resolve: {
    extensions: ['.ts', '.js'],
    modules: [
      'node_modules',
      path.resolve(__dirname)
    ],
  },
  context: __dirname,
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              projectReferences: true
            }
          }
        ]
      },
      {
        test: /\.js$/,
        resolve: {fullySpecified: false},
      }
    ]
  },
  devtool: 'nosources-source-map',
};
