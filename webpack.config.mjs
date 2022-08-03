import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const profiles = {
  core: {entry: './packages/enre-cli/src/index.ts', outname: 'enre-ts.js'},
  'doc-parser': {entry: './packages/enre-doc-parser/src/cli.ts', outname: 'doc-parser.js'},
};

// @ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
export default ({profile}) => {
  if (!['core', 'doc-parser'].includes(profile)) {
    // Set 'profile' default as 'core'
    profile = 'core';
  }

  return {
    target: 'node',
    mode: process.env.NODE_ENV,
    experiments: {topLevelAwait: true},

    entry: profiles[profile].entry,
    output: {
      path: path.resolve(__dirname, './lib'),
      filename: profiles[profile].outname,
      clean: true,
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
    }
  };
};
