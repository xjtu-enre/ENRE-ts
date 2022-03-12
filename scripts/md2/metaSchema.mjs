/**
 * Defines schema for meta describing testcase group.
 */
export const groupSchema = {
  properties: {
    /**
     * Group's name, using for generating case directory.
     */
    name: {type: 'string'},
  },
  optionalProperties: {
    /**
     * Indicates the code snippet should be treated as ESM if true.
     * @default false
     */
    module: {type: 'boolean'},
  },
};

/**
 * Defines schema for meta describing single testsuite.
 */
export const caseSchema = {
  properties: {
    /**
     * Case's name
     */
    name: {type: 'string'},
  },
  optionalProperties: {
    /**
     * Will be inherited from belonging group if not set.
     */
    module: {type: 'boolean'},
    filter: {type: ['array', 'string']}
  },
};
