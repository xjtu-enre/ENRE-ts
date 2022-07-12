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
  },
};
