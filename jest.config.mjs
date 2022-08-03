// @ts-check

/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    'node_modules',
    'cases',
    'lib',
  ],
  moduleNameMapper: {
    '@enre/(.*)': '<rootDir>/packages/enre-$1/src',
    /**
     * Fix 'chalk' using package.json's 'imports' field to rewrite import specifiers.
     * This is only a workaround for jest not supporting 'imports' field,
     * any update of jest should be monitored if it resolves this issue.
     */
    '#ansi-styles': '<rootDir>/node_modules/chalk/source/vendor/ansi-styles/index.js',
    '#supports-color': '<rootDir>/node_modules/chalk/source/vendor/supports-color/index.js',
  },
  /**
   * 'chalk' is ESM module, which needs transform
   */
  transformIgnorePatterns: ['node_modules/(?!chalk)'],
};
