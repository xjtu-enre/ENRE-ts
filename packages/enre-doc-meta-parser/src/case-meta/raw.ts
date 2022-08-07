/**
 * Defines schema for meta describing single testcase.
 */
export const schemaObj = {
  type: 'object',
  properties: {
    /**
     * Case's name.
     *
     * Any non-alphabetical character will be converted to `-`.
     */
    name: {type: 'string'},
    /**
     * Config fields in package.json
     */
    pkg: {
      type: 'object',
      properties: {
        /**
         * Determine what module system does the file use.
         */
        type: {enum: ['commonjs', 'module']}
      },
      additionalProperties: false,
    },
    /**
     * Defines entity's fetching properties.
     */
    entity: {
      type: 'object',
      properties: {
        /**
         * Set `type` property for all entity items conveniently.
         *
         * If another `type` is presented in an item,
         * that value will override this.
         */
        type: {
          enum: [
            'package',
            'file',
            'variable',
            'function',
            'parameter',
            'class',
            'field',
            'method',
            'property',
            'namespace',
            'type alias',
            'enum',
            'enum member',
            'interface',
            'type parameter',
            'jsx element',
          ],
        },
        /**
         * Whether allow unlisted entities to exist.
         *
         * Only items without `negative` will be counted,
         * and `Entity: File` will be ignored.
         *
         * Rules in false:
         * 1. If entity.type is set: no more entities with the explicit entity.type, other types are still allowed;
         * 2. If entity.type is not set: no more entities other than those in items, except for 'File';
         * 3. Items that item.negative === true will always be ignored in any circumstance.
         *
         * @default true
         */
        extra: {type: 'boolean', default: true},
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
               * Entity's qualified name.
               */
              qualified: {type: 'string'},
              /**
               * Entity's location (Details explained in packages/enre-location).
               */
              loc: {type: 'string'},
              /**
               * Whether this item is a negative test case.
               *
               * A negative test case is entity that should not be extracted,
               * if an entity similar with this item presents,
               * then the extractor is wrong.
               */
              negative: {type: 'boolean', default: false},
              additionalProperties: false,
            },
            required: ['name', 'loc', 'type'],
            // TODO: For every case, adopt `additionalProperties: false`
            oneOf: [
              /**
               * File
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'file'},
                }
              },
              /**
               * Variable
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
               * Function
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
               * Parameter
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'parameter'},
                  optional: {type: 'boolean'},
                },
              },
              /**
               * Class
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'class'},
                  abstract: {type: 'boolean'},
                },
              },
              /**
               * Field
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'field'},
                  static: {type: 'boolean'},
                  'private': {type: 'boolean'},
                  // If `private` is true, then `implicit` will definitely be `false`.
                  implicit: {type: 'boolean'},
                  abstract: {type: 'boolean'},
                  // If `private` is true, then `TSModifier` will definitely be undefined.
                  TSModifier: {enum: ['public', 'protected', 'private']},
                },
              },
              /**
               * Method
               *
               * Its properties are the union of field's and function's.
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'method'},
                  kind: {enum: ['constructor', 'method', 'get', 'set']},
                  static: {type: 'boolean'},
                  'private': {type: 'boolean'},
                  implicit: {type: 'boolean'},//?
                  async: {type: 'boolean'},
                  generator: {type: 'boolean'},
                  getter: {type: 'boolean'},
                  setter: {type: 'boolean'},
                  abstract: {type: 'boolean'},
                  TSModifier: {enum: ['public', 'protected', 'private']},
                },
              },
              /**
               * Property
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'property'},
                }
              },
              /**
               * Type Alias
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'type alias'},
                },
              },
              /**
               * Enum
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'enum'},
                  const: {type: 'boolean'},
                  declarations: {
                    type: 'array',
                    uniqueItems: true,
                    items: {type: 'string'},
                  },
                }
              },
              /**
               * Enum Member
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'enum member'},
                  value: {type: ['number', 'string']},
                }
              },
              /**
               * Interface
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'interface'},
                  declarations: {
                    type: 'array',
                    uniqueItems: true,
                    items: {type: 'string'},
                  },
                }
              },
              /**
               * Type Parameter
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'type parameter'},
                }
              },
              /**
               * JSX Element
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'jsx element'},
                }
              },
            ],
          },
        },
      },
      additionalProperties: false,
    },
    relation: {
      type: 'object',
      properties: {
        type: {
          enum: [
            'import',
            'export',
            'call',
            'set',
            'use',
            'modify',
            'extend',
            'override',
            'type',
            'implement',
          ]
        },
        extra: {type: 'boolean', default: false},
        items: {
          type: 'array',
          uniqueItems: true,
          items: {
            type: 'object',
            properties: {
              from: {type: 'string'},
              to: {type: 'string'},
              loc: {type: 'string'},
              negative: {type: 'boolean', default: false},
              additionalProperties: false,
            },
            required: ['from', 'to', 'loc'],
            // oneOf: [],
          }
        }
      },
      additionalProperties: false,
    }
  },
  required: ['name'],
  additionalProperties: false,
};

// TODO: Typing it
export type CaseSchema = any;
