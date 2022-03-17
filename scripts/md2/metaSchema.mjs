/**
 * Defines schema for meta describing testcase group.
 */
export const groupSchema = {
  type: 'object',
  properties: {
    /**
     * Group's name, used for generating case directory.
     */
    name: {type: 'string'},
    /**
     * Indicates the code snippet should be treated as ESM if it's true.
     * @default false
     */
    module: {type: 'boolean', default: false},
  },
  required: ['name'],
  additionalProperties: false,
};

const availableEntityKinds = ['variable', 'function', 'parameter', 'class', 'method', 'namespace', 'type', 'enum', 'interface'];
const availableRelationKinds = ['import', 'export', 'call', 'set', 'use', 'extend', 'override', 'type'];

/**
 * Defines schema for meta describing single testsuite.
 */
export const caseSchema = {
  type: 'object',
  properties: {
    /**
     * Case's name.
     */
    name: {type: 'string'},
    /**
     * @inheritable from `group.module`
     */
    module: {type: 'boolean'},
    /**
     * Defines entity's fetching properties.
     */
    entities: {
      type: 'object',
      properties: {
        /**
         * Filter cared entity type.
         *
         * Entity's type will be inherited from here if not set.
         */
        filter: {
          enum: availableEntityKinds,
        },
        /**
         * Whether entities in items are all that should be extracted.
         * @default false
         */
        exact: {type: 'boolean', default: false},
        /**
         * Entities to be validated.
         */
        items: {
          type: 'array',
          uniqueItems: true,
          items: {
            type: 'object',
            properties: {
              /**
               * Entity's name.
               */
              name: {type: 'string'},
              /**
               * Entity's location (being expanded by src/core/utils/locationHelper.ts).
               */
              loc: {
                type: 'array',
                items: {type: 'integer'},
                minItems: 2,
                maxItems: 4,
              },
            },
            /**
             * `type` can be filled if `filter` is set, but will not be overridden.
             */
            required: ['name', 'loc', 'type'],
            oneOf: [
              /**
               * variable
               */
              {
                type: 'object',
                properties: {
                  type: {const: availableEntityKinds[0]},
                  kind: {enum: ['let', 'const', 'var']},
                },
                required: ['kind'],
              },
              /**
               * function
               */
              {
                type: 'object',
                properties: {
                  type: {const: availableEntityKinds[1]},
                  async: {type: 'boolean', default: false},
                  generator: {type: 'boolean', default: false},
                },
              },
            ],
          },
        },
      },
      additionalProperties: false,
    },
  },
  required: ['name'],
  additionalProperties: false,
};
