import Ajv from 'ajv';
import {caseSchema, groupSchema} from './metaSchema.mjs';

const ajv = new Ajv({useDefaults: true, allowUnionTypes: true});
const validateGroup = ajv.compile(groupSchema);
const validateCase = ajv.compile(caseSchema);

/**
 * Validate and normalize meta object.
 * @param meta {Object}
 * @param role {'group' | 'case'}
 * @param group {Object?}
 */
export default (meta, role, group) => {
  switch (role) {
    case 'group':
      return normalizeGroup(meta);
    case 'case':
      return normalizeCase(meta, group);
    default:
      console.error(`Unknown role ${role}`);
      process.exit(-1);
  }
}

/**
 * @param meta {Object}
 */
const normalizeGroup = (meta) => {
  const valid = validateGroup(meta);

  if (!valid) {
    throw validateGroup.errors;
  }

  return meta;
};

const normalizeCase = (meta, group) => {
  // Inheritable properties
  const isModule = group.module;
  const entTypeFilter = meta.entities?.filter;

  // Inheriting, assuming `group` is valid and has been filled with defaults
  if (meta.module === undefined) {
    meta.module = isModule;
  }

  for (let ent of meta.entities.items || []) {
    if (entTypeFilter && !ent.type) {
      ent.type = entTypeFilter;
    }
  }

  // After inheriting, validate the case by ajv
  const valid = validateCase(meta);

  if (!valid) {
    throw validateCase.errors;
  }

  return meta;
};
