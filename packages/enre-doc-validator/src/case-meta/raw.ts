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
     *
     * This field can be omitted, if so, the h6 title will be used instead.
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
     * Assert what errors/warnings should be thrown.
     *
     * // TODO: Decide whether to use error id number, name or full string
     */
    throw: {
      type: 'array',
      uniqueItems: true,
      items: {
        type: 'string',
      }
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
            'alias',
            'block',
            'class',
            'enum',
            'enum member',
            'field',
            'file',
            'function',
            'interface',
            'jsx element',
            'method',
            'namespace',
            'package',
            'parameter',
            'property',
            'type alias',
            'type parameter',
            'variable',
          ],
        },
        /**
         * Whether to allow unlisted entities to exist.
         *
         * Only items without `negative` will be counted.
         *
         * Rules:
         * 1. If `entity.type` is set: no more entities with the explicit `entity.type`, other types are still allowed;
         * 2. If `entity.type` is not set: no more entities other than those in items;
         * 3. Items that `item.negative: true` will always be ignored in any circumstance.
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
               * Entity's location (String format explained in packages/enre-location).
               */
              loc: {type: 'string'},
              /**
               * Whether it is a negative test item.
               *
               * A negative test item is entity that should NOT be extracted.
               */
              negative: {type: 'boolean', default: false},
              additionalProperties: false,
            },
            required: ['name', 'loc', 'type'],
            oneOf: [
              /**
               * Alias
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'alias'},
                },
              },
              /**
               * Block
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'block'},
                  kind: {enum: ['any', 'class-static-block']},
                }
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
                },
              },
              /**
               * Enum Member
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'enum member'},
                  value: {type: ['number', 'string']},
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
                  // If `private` is true, then `TSVisibility` will definitely be undefined.
                  TSVisibility: {enum: ['public', 'protected', 'private']},
                },
              },
              /**
               * File
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'file'},
                },
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
                },
              },
              /**
               * JSX Element
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'jsx element'},
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
                  TSVisibility: {enum: ['public', 'protected', 'private']},
                },
              },
              /**
               * Namespace
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'namespace'},
                  declarations: {
                    type: 'array',
                    uniqueItems: true,
                    items: {type: 'string'},
                  },
                },
              },
              /**
               * Package
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'package'},
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
               * Property
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'property'},
                  signature: {enum: ['property', 'call', 'constructor', 'method', 'index']},
                },
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
               * Type Parameter
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'type parameter'},
                },
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
            'aliasof',
            'call',
            'decorate',
            'export',
            'extend',
            'implement',
            'import',
            'modify',
            'override',
            'set',
            'type',
            'use',
          ]
        },
        extra: {type: 'boolean', default: true},
        items: {
          type: 'array',
          uniqueItems: true,
          items: {
            type: 'object',
            properties: {
              from: {type: 'string'},
              to: {type: 'string'},
              loc: {type: 'string'},
              /**
               * Negative relation expects both entities, and the relation does not exist.
               */
              negative: {type: 'boolean', default: false},
              additionalProperties: false,
            },
            required: ['from', 'to', 'loc'],
            oneOf: [
              /**
               * AliasOf
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'aliasof'},
                },
              },
              /**
               * Call
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'call'},
                },
              },
              /**
               * Decorate
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'decorate'},
                },
              },
              /**
               * Export
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'export'},
                  kind: {enum: ['any', 'type']},
                  default: {type: 'boolean'},
                },
              },
              /**
               * Extend
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'extend'},
                },
              },
              /**
               * Implement
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'implement'},
                },
              },
              /**
               * Import
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'import'},
                  kind: {enum: ['any', 'type']},
                },
              },
              /**
               * Modify
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'modify'},
                },
              },
              /**
               * Override
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'override'},
                },
              },
              /**
               * Set
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'set'},
                  init: {type: 'boolean'},
                },
              },
              /**
               * Type
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'type'},
                },
              },
              /**
               * Use
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'use'},
                },
              },
            ],
          }
        }
      },
      additionalProperties: false,
    }
  },
  additionalProperties: false,
};

// TODO: Typing it
export type CaseSchema = any;
