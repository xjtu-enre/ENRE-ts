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

const availableEntityKinds = ['package', 'file', 'variable', 'function', 'parameter', 'class', 'field', 'method', 'property', 'namespace', 'type', 'enum', 'enum member', 'interface'];
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
         * Whether entities listed are all that should be extracted.
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
               * Assert this entity should not be extracted.
               *
               * This ignores @exact
               */
              negative: {type: 'boolean', default: false},
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
              additionalProperties: false,
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
                  type: {const: 'variable'},
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
                  type: {const: 'function'},
                  async: {type: 'boolean'},
                  generator: {type: 'boolean'},
                },
              },
              /**
               * parameter
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'parameter'},
                },
              },
              /**
               * class
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'class'},
                },
              },
              /**
               * field
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'field'},
                  static: {type: 'boolean'},
                  'private': {type: 'boolean'},
                  /**
                   * If `private` is true, then `implicit` will definitely be `false`.
                   */
                  implicit: {type: 'boolean'},
                },
              },
              /**
               * method
               *
               * Its properties are the union of field's and function's.
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'method'},
                  static: {type: 'boolean'},
                  'private': {type: 'boolean'},
                  implicit: {type: 'boolean'},//?
                  async: {type: 'boolean'},
                  generator: {type: 'boolean'},
                  getter: {type: 'boolean'},
                  setter: {type: 'boolean'},
                },
              },
              /**
               * enum
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'enum'},
                  const: {type: 'boolean'},
                }
              },
              /**
               * enum member
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'enum member'},
                  value: {type: ['number', 'string']},
                }
              }
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
