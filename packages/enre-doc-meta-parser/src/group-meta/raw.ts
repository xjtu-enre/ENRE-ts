import {JSONSchemaType} from 'ajv';

/**
 * Defines schema for meta describing testcase group.
 */
export const schemaObj: JSONSchemaType<GroupSchema> = {
  type: 'object',
  properties: {
    /**
     * Group's name, used for generating a directory containing all examples.
     *
     * It is preferred to use space, space will be transcribed to `-`.
     */
    name: {type: 'string'},
  },
  required: ['name'],
  additionalProperties: false,
};

export interface GroupSchema {
  name: string;
}
