import {
  ENREEntityCollectionAll,
  ENREEntityCollectionInFile,
  ENREEntityCollectionScoping,
  SearchingGuidance,
  typeEntityTypes,
  valueEntityTypes,
} from '@enre/data';
import {logger} from '@enre/core';

export default function (sg: SearchingGuidance, omitAlias = false): ENREEntityCollectionAll | ENREEntityCollectionAll[] | undefined {
  /**
   * Though multiple entities in the same scope cannot have duplicated identifier,
   * it is still possible for a JS value entity and TS type entity to remain
   * the same identifier, while importing/exporting, it is both two entities
   * are imported/exported.
   */
  const results: ENREEntityCollectionAll[] = [];

  let curr = sg.at;

  // Find only default export
  if (sg.role === 'default-export') {
    if (curr.type !== 'file') {
      logger.error(`Cannot find default export in ${curr.type} entity, expecting file entity.`);
      return;
    }

    // Single entity or a value entity and a type entity
    return curr.exports.filter(r => r.isDefault).map(r => r.to);
  }
  // Find only in named exports
  else if (sg.exportsOnly) {
    if (curr.type !== 'file') {
      logger.error(`Cannot find exports in ${curr.type} entity, expecting file entity.`);
      return;
    }

    for (const exportRelation of curr.exports) {
      const aliasName = exportRelation.alias?.name.payload;

      if (!exportRelation.isDefault &&
        (
          aliasName === sg.identifier
          // export.to shouldn't be a file, since this case should be directly bound in the traverse phase.
          || (exportRelation.to as ENREEntityCollectionInFile).name.codeName === sg.identifier
        )
      ) {
        const returned = exportRelation.alias ?? exportRelation.to;

        // @ts-ignore
        if ((sg.role === 'value' && valueEntityTypes.includes(exportRelation.to.type)) ||
          // @ts-ignore
          (sg.role === 'type' && typeEntityTypes.includes(exportRelation.to.type))) {
          return returned;
        } else if (sg.role === 'any') {
          results.push(returned);
        }
      }
    }
  }
  // Find according to symbol scope
  else {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      for (const e of curr.children) {
        // TODO: Refactor this to clearly distinguish valid identifier and string literal
        if (sg.identifier === e.name.codeName) {
          // @ts-ignore
          if ((sg.role === 'value' && valueEntityTypes.includes(e.type)) ||
            // @ts-ignore
            (sg.role === 'type' && typeEntityTypes.includes(e.type))) {
            return e;
          } else if (sg.role === 'any') {
            // Does not return in case two entities are not in the same scope
            results.push(e);
          }
        }
      }

      // TODO: Handle TS namespace import/export

      if (curr.type === 'file') {
        // Also find in file entity's import
        if (!sg.localOnly) {
          for (const importRelation of curr.imports) {
            /**
             * Import alias (if any) can only be identifier.
             *
             * Not side effect import, the other case of `file-import->file` is namespace import,
             * which will always correspond an alias entity.
             */
            if (importRelation.alias?.name.payload === sg.identifier ||
              (importRelation.to.type !== 'file' && importRelation.to.name.codeName === sg.identifier)) {
              let returned = importRelation.alias ?? importRelation.to;
              if (omitAlias) {
                while (returned.type === 'alias') {
                  returned = returned.ofRelation.to;
                }
              }

              // @ts-ignore
              if ((sg.role === 'value' && valueEntityTypes.includes(importRelation.to.type)) ||
                // @ts-ignore
                (sg.role === 'type' && typeEntityTypes.includes(importRelation.to.type))) {
                return returned;
              } else if (sg.role === 'any') {
                results.push(returned);
              }
            }
          }
        }
        // Break the lookup
        break;
      } else {
        curr = curr.parent as ENREEntityCollectionScoping;
      }
    }

    // TODO: Find in built-in
  }

  if (sg.role === 'any') {
    return results;
  } else {
    // Found no desired symbol
    return undefined;
  }
}
