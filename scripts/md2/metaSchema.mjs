/**
 * Defines schema for meta describing testcase group.
 */
export const groupSchema = {
  type: 'object',
  properties: {
    /**
     * Group's name, using for generating case directory.
     */
    name: {type: 'string'},
    /**
     * Indicates the code snippet should be treated as ESM if true, else .
     * @default false
     */
    module: {type: 'boolean'},
  },
  required: ['name'],
  additionalProperties: false,
};

/**
 * Defines schema for meta describing single testsuite.
 */
export const caseSchema = {
  type: 'object',
  properties: {
    /**
     * Case's name
     */
    name: {type: 'string'},
    /**
     * Will be inherited from belonging group if not set.
     */
    module: {type: 'boolean'},
    /**
     * Filter cared entity type.
     * Will fetch all entity if not set.
     */
    filter: {
      oneOf: [
        {type: 'string'},
        {type: 'array', uniqueItems: true, items: {type: 'string'}}
      ]
    },
    entities: {}
  },
  required: true,
  additionalProperties: false,
};
