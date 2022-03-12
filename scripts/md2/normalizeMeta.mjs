import {strict as assert} from 'assert';
import Ajv from 'ajv/dist/jtd';
import {groupSchema} from './metaSchema.mjs';

const ajv = new Ajv();
const validateGroup = ajv.compile(groupSchema);

/**
 * Validate and normalize meta object.
 * @param meta {Object}
 * @param role {'group' | 'case'}
 * @param group {Object?}
 */
export default (meta, role, group) => {
  switch (role) {
  case 'group':
    normalizeGroup(meta);
    break;
  case 'case':
    normalizeCase(meta, group);
    break;
  default:
    console.error(`Unknown role ${role}`);
    process.exit(-1);
  }
}

/**
 * @param meta {Object}
 */
const normalizeGroup = (meta) => {
  const keys = meta.keys();

  // Required fields
  for (const field of requiredGroupFields) {
    // Validate key
    assert(keys.indexOf(field.key) > -1, `Missing required meta key ${field.key}`);
    // Validate type
    if (!(field.type instanceof Array)) {

    }
    assert(
      meta[field.key] instanceof field.type,
      `Required meta key ${field.key} is expected to conform to type ${field.type}, instead got ${typeof meta[field.key]}`
    );
  }
};

const normalizeCase = (meta, group) => {

};
