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
    /**
     * Skip strict format check.
     * This is useful for cases that are not convenient or too complicated to write into docs.
     *
     * However, it is suggested that still writes tests fixtures and test suites directly under /tests.
     */
    freeForm: {type: 'boolean', default: false},
  },
  required: ['name'],
  additionalProperties: false,
};

export interface GroupSchema {
  name: string;
  freeForm: boolean;
}
