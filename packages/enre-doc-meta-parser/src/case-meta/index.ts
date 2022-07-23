import {buildENREName} from '@enre/naming';
import {ajv, toUrlFriendlyName} from '../common';
import locMetaParser from '../loc-meta';
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

  // After validating, convert loc string to object
  // @ts-ignore
  for (const ent of meta.entity?.items || []) {
    ent.name = buildENREName(ent.name);
    ent.loc = locMetaParser(ent.loc, ent.name);
  }

  // After validating, convert name to url-friendly-name
  meta.name = toUrlFriendlyName(meta.name as string);

  return meta;
};
