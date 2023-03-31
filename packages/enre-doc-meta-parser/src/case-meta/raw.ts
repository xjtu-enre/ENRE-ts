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
          type: 'string',
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
              type: {type: 'string'},
              /**
               * Whether this item is a negative test case.
               *
               * A negative test case is entity that should not be extracted,
               * if an entity similar with this item presents,
               * then the extractor is wrong.
               */
              negative: {type: 'boolean', default: false},
            },
            required: ['name', 'loc', 'type'],
          },
        },
      },
    },
    relation: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
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
              negative: {type: 'boolean', default: false},
            },
            required: ['from', 'to', 'loc'],
          }
        }
      },
    }
  },
  required: ['name'],
};

// TODO: Typing it
export type CaseSchema = any;
