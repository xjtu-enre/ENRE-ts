import {buildENREName} from '@enre/naming';
import {ajv, toUrlFriendlyName} from '../common';
import entityRefMetaParser from '../entity-ref-meta';
import locMetaParser from '../loc-meta';
import {schemaObj} from './raw';

const validator = ajv.compile(schemaObj);

export default (meta: any) => {
  let typeInitializer = meta.entity?.type;

  // Pre-fulfill fields that are not part of the schema
  // Fulfill `type` for entity.items
  for (const ent of meta.entity?.items || []) {
    if (typeInitializer && !ent.type) {
      ent.type = typeInitializer;
    }
  }

  // Fulfill `type` for relation.items
  typeInitializer = meta.relation?.type;
  for (const rel of meta.relation?.items || []) {
    if (typeInitializer && !rel.type) {
      rel.type = typeInitializer;
    }
  }

  // After preprocessing, validate cases by ajv
  const valid = validator(meta);

  if (!valid) {
    throw validator.errors;
  }

  // After validating, convert string representations to objects
  for (const ent of (meta as any).entity?.items || []) {
    ent.name = buildENREName(ent.name);
    ent.loc = locMetaParser(ent.loc, ent.name);
  }

  for (const rel of (meta as any).relation?.items || []) {
    rel.from = entityRefMetaParser(rel.from);
    rel.to = entityRefMetaParser(rel.to);
    rel.loc = locMetaParser(rel.loc);
  }

  // After validating, convert name to url-friendly-name
  meta.name = toUrlFriendlyName(meta.name as string);

  return meta;
};
