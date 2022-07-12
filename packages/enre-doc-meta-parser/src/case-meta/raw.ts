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
            'variable',
            'function',
            'parameter',
            'class',
            'field',
            'method',
            'namespace',
            'type',
            'enum',
            'interface',
          ],
        },
        /**
         * Whether allow unlisted entities to exist.
         *
         * Only items without `negative` will be counted,
         * and `Entity: File` will be ignored.
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
               * Entity's location (Details in packages/enre-location).
               */
              loc: {
                type: 'array',
                items: {type: 'integer'},
                minItems: 2,
                maxItems: 4,
              },
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
            oneOf: [
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
                },
              },
              /**
               * Class
               */
              {
                type: 'object',
                properties: {
                  type: {const: 'class'},
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
                  /**
                   * If `private` is true, then `implicit` will definitely be `false`.
                   */
                  implicit: {type: 'boolean'},
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
                  static: {type: 'boolean'},
                  'private': {type: 'boolean'},
                  implicit: {type: 'boolean'},//?
                  async: {type: 'boolean'},
                  generator: {type: 'boolean'},
                  getter: {type: 'boolean'},
                  setter: {type: 'boolean'},
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

// TODO: Typing it
export type CaseSchema = any;
