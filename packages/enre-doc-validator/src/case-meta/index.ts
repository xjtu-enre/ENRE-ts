// @ts-nocheck

import {ajv, toUrlFriendlyName} from '../common';
import entityRefMetaParser from '../entity-ref-meta';
import locMetaParser from '../loc-meta';
import {schemaObj} from './raw';
import ENREName from '@enre-ts/naming';

let validator = ajv.compile(schemaObj);

/**
 * Instead of using built-in case schema (which only suits for JavaScript/TypeScript),
 * override it with a custom schema located in the given path. Doc-parser will then utilize
 * it to validate the format of test assertion block.
 *
 * @param schemaObj The JSON schema object.
 */
export function useCustomCaseSchema(schemaObj: any) {
  validator = ajv.compile(schemaObj);
}

export default (meta: any, h6title: string) => {
  let typeInitializer = meta.entity?.type;

  // Pre-fulfill fields that are not part of the schema
  for (const ent of meta.entity?.items || []) {
    // Fulfill `type` for entity.items
    if (typeInitializer && !ent.type) {
      ent.type = typeInitializer;
    }
    ent.type = ent.type.toLowerCase();
  }

  typeInitializer = meta.relation?.type;
  for (const rel of meta.relation?.items || []) {
    // Fulfill `type` for relation.items
    if (typeInitializer && !rel.type) {
      rel.type = typeInitializer;
    }
    rel.type = rel.type.toLowerCase();

    // Fulfill `implicit` for relation.items
    rel.implicit = meta.relation?.implicit ?? false;
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
