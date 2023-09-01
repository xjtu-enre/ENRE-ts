import {
  ENREEntityClass,
  ENREEntityCollectionAll,
  ENREEntityCollectionInFile,
  ENREEntityFile,
  ENREEntityInterface,
  ENREPseudoRelation,
  ENRERelationAbilityBase,
  ENRERelationCall,
  ENRERelationCollectionAll,
  ENRERelationDecorate,
  ENRERelationExport,
  ENRERelationExtend,
  ENRERelationImplement,
  ENRERelationImport,
  ENRERelationModify,
  ENRERelationSet,
  ENRERelationType,
  pseudoR,
  recordRelationCall,
  recordRelationDecorate,
  recordRelationExport,
  recordRelationExtend,
  recordRelationImplement,
  recordRelationImport,
  recordRelationModify,
  recordRelationSet,
  recordRelationType
} from '@enre/data';
import lookup from './lookup';
import {codeLogger} from '@enre/core';

type WorkingPseudoR<T extends ENRERelationAbilityBase> = ENREPseudoRelation<T> & { resolved: boolean }

// TODO: Handle import/export type

const bindExport = (pr: WorkingPseudoR<ENRERelationExport>) => {
  pr.resolved = false;

  let found;
  if (pr.to.role === 'default-export' || pr.to.role === 'any') {
    found = lookup(pr.to) as ENREEntityCollectionAll[];
    if (found.length !== 0) {
      for (const single of found) {
        recordRelationExport(
          pr.from as ENREEntityFile,
          single as ENREEntityCollectionAll,
          pr.location,
          {
            kind: pr.kind,
            isDefault: pr.isDefault ?? false,
            isAll: pr.isAll,
            sourceRange: pr.sourceRange,
            alias: pr.alias,
          },
        );
      }

      pr.resolved = true;
    }
  } else {
    found = lookup(pr.to) as ENREEntityCollectionAll;
    if (found) {
      recordRelationExport(
        pr.from as ENREEntityFile,
        found,
        pr.location,
        {
          kind: pr.kind,
          isDefault: pr.isDefault ?? false,
          isAll: pr.isAll,
          sourceRange: pr.sourceRange,
          alias: pr.alias,
        }
      );

      pr.resolved = true;
    }
  }
};

const bindImport = (pr: WorkingPseudoR<ENRERelationImport>) => {
  pr.resolved = false;

  let found;
  if (pr.to.role === 'default-export' || pr.to.role === 'any') {
    found = lookup(pr.to) as ENREEntityCollectionAll[];
    if (found.length !== 0) {
      for (const single of found) {
        recordRelationImport(
          pr.from as ENREEntityFile,
          single as ENREEntityCollectionAll,
          pr.location,
          {
            kind: pr.kind,
            sourceRange: pr.sourceRange,
            alias: pr.alias,
          },
        );
      }

      pr.resolved = true;
    }
  } else {
    found = lookup(pr.to) as ENREEntityCollectionAll;
    if (found) {
      recordRelationImport(
        pr.from as ENREEntityFile,
        found,
        pr.location,
        {
          kind: pr.kind,
          sourceRange: pr.sourceRange,
          alias: pr.alias,
        }
      );

      pr.resolved = true;
    }
  }
};

export default () => {
  /**
   * Link `Relation: Export` first
   */
  for (const pr of pseudoR.exports as unknown as WorkingPseudoR<ENRERelationExport>[]) {
    bindExport(pr);
  }

  /**
   * Link `Relation: Import` then
   */
  for (const pr of pseudoR.imports as unknown as WorkingPseudoR<ENRERelationImport>[]) {
    bindImport(pr);
  }

  for (const pr of pseudoR.all as unknown as WorkingPseudoR<ENRERelationCollectionAll>[]) {
    /**
     * Most import/export relations should be resolved, however in case of 'import then export',
     * where the export relation was tried to be resolved first, and the dependent import relation was
     * not resolved, and thus the resolve failed.
     *
     * Hence, the second time resolving for import/export is still needed.
     */
    if (pr.resolved) {
      continue;
    }

    switch (pr.type) {
      case 'import': {
        bindImport(pr as unknown as WorkingPseudoR<ENRERelationImport>);
        break;
      }

      case 'export': {
        bindExport(pr as unknown as WorkingPseudoR<ENRERelationExport>);
        break;
      }

      case 'call': {
        const pr1 = pr as unknown as WorkingPseudoR<ENRERelationCall>;
        const found = lookup(pr1.to) as ENREEntityCollectionAll;
        if (found) {
          recordRelationCall(
            pr1.from,
            found,
            pr1.location,
            {isNew: false},
          );
          pr1.resolved = true;
        }

        break;
      }

      case 'set': {
        const pr1 = pr as unknown as WorkingPseudoR<ENRERelationSet>;
        const found = lookup(pr1.to) as ENREEntityCollectionAll;
        if (found) {
          if (found.type === 'variable' && found.kind === 'const') {
            codeLogger.warn(`ESError: Cannot assign to '${found.name.string}' because it is a constant.`);
            continue;
          }

          recordRelationSet(
            pr1.from,
            found,
            pr1.location,
            {isInit: pr1.isInit},
          );
          pr1.resolved = true;
        }
        break;
      }

      case 'use': {
        break;
      }

      case 'modify': {
        const pr1 = pr as unknown as WorkingPseudoR<ENRERelationModify>;
        const found = lookup(pr1.to) as ENREEntityCollectionAll;
        if (found) {
          if (found.type === 'variable' && found.kind === 'const') {
            codeLogger.warn(`ESError: Cannot assign to '${found.name.string}' because it is a constant.`);
            continue;
          }

          recordRelationModify(
            pr1.from,
            found,
            pr1.location,
          );
          pr1.resolved = true;
        }
        break;
      }

      case 'extend': {
        const pr1 = pr as unknown as WorkingPseudoR<ENRERelationExtend>;
        const found = lookup(pr.to) as ENREEntityCollectionAll;

        if (found) {
          if (pr1.from.type === 'class') {
            recordRelationExtend(
              pr1.from,
              found as ENREEntityClass,
              pr1.location,
            );
          } else if (pr1.from.type === 'interface') {
            recordRelationExtend(
              pr1.from,
              found as ENREEntityClass | ENREEntityInterface,
              pr1.location,
            );
          } else if (pr1.from.type === 'type parameter') {
            recordRelationExtend(
              pr1.from,
              found as ENREEntityCollectionInFile,
              pr1.location,
            );
          } else {
            codeLogger.error(`Unexpected from entity type ${pr1.from.type} for \`Relation: Extend\`.`);
            continue;
          }
          pr.resolved = true;
        }
        break;
      }

      case 'override': {
        // Override is handled in the next phase
        break;
      }

      case 'decorate': {
        const pr1 = pr as unknown as WorkingPseudoR<ENRERelationDecorate>;
        const found = lookup(pr1.from) as ENREEntityCollectionInFile;
        if (found) {
          recordRelationDecorate(
            found,
            pr1.to as ENREEntityCollectionInFile,
            pr1.location,
          );
          pr.resolved = true;
        }
        break;
      }

      case 'type': {
        const pr1 = pr as unknown as WorkingPseudoR<ENRERelationType>;
        const found = lookup(pr1.from) as ENREEntityCollectionInFile;
        if (found) {
          recordRelationType(
            found,
            pr1.to as ENREEntityCollectionInFile,
            pr1.location,
          );
          pr.resolved = true;
        }
        break;
      }

      case 'implement': {
        const pr1 = pr as unknown as WorkingPseudoR<ENRERelationImplement>;
        const found = lookup(pr1.to) as ENREEntityCollectionInFile;
        if (found) {
          recordRelationImplement(
            pr1.from as ENREEntityCollectionInFile,
            found,
            pr1.location,
          );
          pr.resolved = true;
        }
        break;
      }
    }
  }
};
