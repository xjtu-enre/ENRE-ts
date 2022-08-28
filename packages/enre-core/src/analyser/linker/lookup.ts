import {
  ENREEntityCollectionAll,
  ENREEntityCollectionInFile,
  ENREEntityCollectionScoping,
  ENREPseudoRelation,
  ENRERelationExport
} from '@enre/container';
import {error} from '@enre/logging';

const valueEntityTypes = ['variable', 'function', 'parameter', 'class', 'field', 'method', 'property', 'namespace', 'enum', 'enum member'];
const typeEntityTypes = ['class', 'property', 'namespace', 'type alias', 'enum', 'enum member', 'interface', 'type parameter'];

function lookup(expected: 'value' | 'type', pe: ENREPseudoRelation['to'], scope: ENREEntityCollectionScoping): ENREEntityCollectionAll | ENRERelationExport | undefined;
function lookup(expected: 'all', pe: ENREPseudoRelation['to'], scope: ENREEntityCollectionScoping): Array<ENREEntityCollectionAll | ENRERelationExport>;
function lookup(
  expected: 'value' | 'type' | 'all',
  pe: ENREPseudoRelation['to'],
  scope: ENREEntityCollectionScoping,
): Array<ENREEntityCollectionAll | ENRERelationExport> | ENREEntityCollectionAll | ENRERelationExport | undefined {
  // Cannot find value given type
  if (pe.role !== 'export-default' && pe.role !== expected) {
    error(`Cannot convert pseudo relation to real relation: expecting ${expected} but got ${pe.role}.`);
    return;
  }

  /**
   * Though multiple entities in the same scope cannot have duplicated identifier,
   * it is still possible for a JS value entity and TS type entity to remain
   * the same identifier, while importing/exporting, it is both two entities
   * are imported/exported.
   */
  const accumulated: Array<ENREEntityCollectionAll | ENRERelationExport> = [];

  let curr = scope;

  // Find only default export
  if (pe.role === 'export-default') {
    if (scope.type !== 'file') {
      error(`Cannot find default export in ${scope.type} entity, expecting file entity.`);
      return;
    }

    return scope.exports.find(r => r.isDefault)?.to;
  }
  // Find only in named exports
  else if (pe.exportsOnly) {
    if (scope.type !== 'file') {
      error(`Cannot find exports in ${scope.type} entity, expecting file entity.`);
      return;
    }

    for (const exportRelation of scope.exports) {
      if (!exportRelation.isDefault
        && (
          exportRelation.alias === pe.identifier
          || (exportRelation.to as ENREEntityCollectionInFile).name.codeName === pe.identifier
        )
      ) {
        if (pe.role === 'all') {
          accumulated.push(exportRelation);
        } else {
          return exportRelation;
        }
      }
    }
  }
  // Find according to symbol scope
  else {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      for (const e of curr.children) {
        if (pe.identifier === e.name.codeName) {
          if ((expected === 'value' && valueEntityTypes.includes(e.type)) || (expected === 'type' && typeEntityTypes.includes(e.type))) {
            return e;
          } else if (expected === 'all') {
            accumulated.push(e);
          }
        }
      }

      if (!pe.noImport) {
        // TODO: Find in namespace's imports

        // Also find in file entity's import
        if (curr.type === 'file') {
          for (const ip of curr.imports) {
            // TODO: The condition might be wrong, double check this
            if (ip.alias === pe.identifier || (ip.to.type !== 'file' && ip.to.name.codeName === pe.identifier)) {
              if (expected !== 'all') {
                return ip.to;
              } else {
                accumulated.push(ip.to);
              }
            }
          }

          // TODO: Find in built-ins

          break;
        } else {
          // Cannot find in current scope, lookup parent scope
          curr = curr.parent as ENREEntityCollectionScoping;
        }
      } else {
        break;
      }
    }
  }

  if (expected === 'all') {
    return accumulated;
  } else {
    return;
  }
}

export default lookup;
