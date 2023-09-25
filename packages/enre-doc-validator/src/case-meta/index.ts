// @ts-nocheck

import {ajv, toUrlFriendlyName} from '../common';
import entityRefMetaParser from '../entity-ref-meta';
import locMetaParser from '../loc-meta';
import {schemaObj} from './raw';
import {schemaObjBasic} from './basic';
import ENREName from '@enre/naming';

export default (meta: any, h6title: string, useBasic = false) => {
  let validator;
  if (useBasic) {
    validator = ajv.compile(schemaObjBasic);
  } else {
    validator = ajv.compile(schemaObj);
  }

  let typeInitializer = meta.entity?.type;

  // Pre-fulfill fields that are not part of the schema
  // Fulfill `type` for entity.items
  for (const ent of meta.entity?.items || []) {
    if (typeInitializer && !ent.type) {
      ent.type = typeInitializer;
    }
    ent.type = ent.type.toLowerCase();
  }

  // Fulfill `type` for relation.items
  typeInitializer = meta.relation?.type;
  for (const rel of meta.relation?.items || []) {
    if (typeInitializer && !rel.type) {
      rel.type = typeInitializer;
    }
    rel.type = rel.type.toLowerCase();
  }

  // After preprocessing, validate cases by ajv
  const valid = validator(meta);

  if (!valid) {
    throw validator.errors;
  }

  // After validating, convert string representations to objects
  for (const ent of (meta as any).entity?.items || []) {
    ent.name = ENREName.fromString(ent.name);
    ent.loc = locMetaParser(ent.loc, ent.name);
    ent.declarations ? ent.declarations = ent.declarations.forEach((d: string) => locMetaParser(d)) : undefined;
  }

  for (const rel of (meta as any).relation?.items || []) {
    rel.from = entityRefMetaParser(rel.from);
    rel.to = entityRefMetaParser(rel.to);
    rel.loc = locMetaParser(rel.loc);
  }

  // If meta.name was not presented, use h6 title instead
  // After validating, convert name to url-friendly-name
  meta.name = toUrlFriendlyName(meta.name ?? h6title);

  return meta;
};
