import {
  ENREEntityClass,
  ENREEntityCollectionAll,
  ENREEntityFile,
  ENREEntityInterface,
  ENREEntityTypeParameter,
  ENREPseudoRelation,
  ENRERelationExport,
  pseudoR,
  recordRelationExport,
  recordRelationExtend,
  recordRelationImplement,
  recordRelationImport,
  recordRelationModify,
  recordRelationSet
} from '@enre/container';
import {error, warn} from '@enre/logging';
import lookup from './lookup';

type Intermediate = ENREPseudoRelation & { resolved: boolean };

export default () => {
  /**
   * Link `Relation: Export` first
   */
  for (const pr of (pseudoR.exports as Intermediate[])) {
    pr.resolved = false;

    let found;
    if (pr.to.role === 'export-default') {
      found = lookup('all', pr.to, pr.at) as unknown as ENREEntityCollectionAll;
      if (found) {
        recordRelationExport(
          pr.from as ENREEntityFile,
          found,
          pr.location,
          // @ts-ignore
          {kind: pr.kind, alias: pr.alias, isDefault: pr.isDefault ?? false}
        );
        pr.resolved = true;
      }
    } else if (pr.to.role === 'all') {
      found = lookup('all', pr.to, pr.at) as ENREEntityCollectionAll[];
      if (found.length > 0) {
        for (const i of found) {
          recordRelationExport(
            pr.from as ENREEntityFile,
            i,
            pr.location,
            // @ts-ignore
            {kind: pr.kind, alias: pr.alias, isDefault: pr.isDefault ?? false}
          );
          pr.resolved = true;
        }
      } else {
        continue;
      }
    } else {
      found = lookup(pr.to.role, pr.to, pr.at) as ENREEntityCollectionAll;
      if (found) {
        recordRelationExport(
          pr.from as ENREEntityFile,
          found,
          pr.location,
          // @ts-ignore
          {kind: pr.kind, alias: pr.alias, isDefault: pr.isDefault ?? false}
        );
        pr.resolved = true;
      }
    }
  }

  /**
   * Link `Relation: Import` then
   */
  for (const pr of (pseudoR.imports as Intermediate[])) {
    pr.resolved = false;

    let found;
    // Pended module resolve request
    if (pr.to.role === 'export-default') {
      found = lookup('all', pr.to, pr.at) as unknown as ENREEntityCollectionAll;
      if (found) {
        recordRelationImport(
          pr.from as ENREEntityFile,
          found,
          pr.location,
          // @ts-ignore
          {kind: pr.kind ?? 'value', alias: pr.alias},
        );
        pr.resolved = true;
      }
    } else if (pr.to.role === 'all') {
      found = lookup('all', pr.to, pr.at) as ENRERelationExport[];
      if (found.length > 0) {
        for (const i of found) {
          recordRelationImport(
            pr.from as ENREEntityFile,
            i.to,
            pr.location,
            // @ts-ignore
            {kind: pr.kind ?? 'value', alias: pr.alias ?? i.alias},
          );
          pr.resolved = true;
        }
      } else {
        continue;
      }
    } else {
      found = lookup(pr.to.role, pr.to, pr.at) as ENRERelationExport;
      if (found) {
        recordRelationImport(
          pr.from as ENREEntityFile,
          found.to,
          pr.location,
          // @ts-ignore
          {kind: pr.kind ?? 'value', alias: pr.alias ?? i.alias},
        );
        pr.resolved = true;
      }
    }
  }

  for (const pr of (pseudoR.all as Intermediate[])) {
    // `Export`/`Import` relations should be already resolved
    if (pr.resolved) {
      continue;
    }

    pr.resolved = false;

    switch (pr.type) {
      case 'import': {
        // Already handled in advance
        break;
      }

      case 'export': {
        // Already handled in advance
        break;
      }

      case 'call': {
        break;
      }

      case 'set': {
        const found = lookup('value', pr.to, pr.at) as ENREEntityCollectionAll;
        if (found) {
          if (found.type === 'variable' && found.kind === 'const') {
            warn(`ESError: Cannot assign to '${found.name.printableName}' because it is a constant.`);
            continue;
          }

          recordRelationSet(
            pr.from as ENREEntityCollectionAll,
            found,
            pr.location,
            // @ts-ignore
            pr.isInit,
          );
          pr.resolved = true;
        }
        break;
      }

      case 'use': {
        break;
      }

      case 'modify': {
        const found = lookup('value', pr.to, pr.at) as ENREEntityCollectionAll;
        if (found) {
          if (found.type === 'variable' && found.kind === 'const') {
            warn(`ESError: Cannot assign to '${found.name.printableName}' because it is a constant.`);
            continue;
          }

          recordRelationModify(
            pr.from as ENREEntityCollectionAll,
            found,
            pr.location,
          );
          pr.resolved = true;
        }
        break;
      }

      case 'extend': {
        let found;
        if (pr.from.type === 'class') {
          found = lookup('value', pr.to, pr.at);
        } else {
          found = lookup('type', pr.to, pr.at);
        }

        if (found) {
          if (pr.from.type === 'class') {
            recordRelationExtend<ENREEntityClass>(
              pr.from,
              found as ENREEntityClass,
              pr.location,
            );
          } else if (pr.from.type === 'interface') {
            recordRelationExtend<ENREEntityInterface>(
              pr.from,
              found as ENREEntityClass | ENREEntityInterface,
              pr.location,
            );
          } else if (pr.from.type === 'type parameter') {
            recordRelationExtend<ENREEntityTypeParameter>(
              pr.from,
              found as ENREEntityCollectionAll,
              pr.location,
            );
          } else {
            error(`Unexpected from entity type ${pr.from.type} for \`Relation: Extend\`.`);
            continue;
          }
          pr.resolved = true;
        }
        break;
      }

      case 'override': {
        break;
      }

      case 'type': {
        break;
      }

      case 'implement': {
        const found = lookup('type', pr.to, pr.at);
        if (found) {
          recordRelationImplement(
            pr.from as ENREEntityClass,
            found as ENREEntityClass | ENREEntityInterface,
            pr.location,
          );
          pr.resolved = true;
        }
        break;
      }
    }
  }
};
