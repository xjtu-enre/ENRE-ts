import {ajv, toUrlFriendlyName} from '../common';
import {schemaObj} from './raw';

const validator = ajv.compile(schemaObj);

export default (meta: any) => {
  const typeInitializer = meta.entity?.type;

  // Pre-fulfill fields that are not part of the schema
  // Fulfill `type` for entity.items
  for (const ent of meta.entity?.items || []) {
    if (typeInitializer && !ent.type) {
      ent.type = typeInitializer;
    }
  }

  // After preprocessing, validate cases by ajv
  const valid = validator(meta);

  if (!valid) {
    throw validator.errors;
  }

  // After validating, convert name to url-friendly-name
  meta.name = toUrlFriendlyName(meta.name as string);

  return meta;
};
