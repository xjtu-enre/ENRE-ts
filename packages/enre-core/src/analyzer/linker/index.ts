import {
  ENREEntityClass,
  ENREEntityCollectionAll,
  ENREEntityCollectionInFile,
  ENREEntityFile,
  ENREEntityInterface,
  ENREEntityUnknown,
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
  id,
  postponedTask,
  pseudoR,
  recordRelationCall,
  recordRelationDecorate,
  recordRelationExport,
  recordRelationExtend,
  recordRelationImplement,
  recordRelationImport,
  recordRelationModify,
  recordRelationSet,
  recordRelationType,
  recordRelationUse,
  recordThirdPartyEntityUnknown,
  rGraph
} from '@enre/data';
import lookup from './lookup';
import {codeLogger} from '@enre/core';
import ENREName from '@enre/naming';

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
          pr.from as id<ENREEntityFile>,
          single as id<ENREEntityCollectionAll>,
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
    found = lookup(pr.to) as id<ENREEntityCollectionAll>;
    if (found) {
      recordRelationExport(
        pr.from as id<ENREEntityFile>,
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
          pr.from as id<ENREEntityFile>,
          single as id<ENREEntityCollectionAll>,
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
    found = lookup(pr.to) as id<ENREEntityCollectionAll>;
    if (found) {
      recordRelationImport(
        pr.from as id<ENREEntityFile>,
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

  /**
   * Most import/export relations should be resolved, however in case of 'import then export',
   * where the export relation was tried to be resolved first, and the dependent import relation was
   * not resolved, and thus the resolve failed.
   *
   * Hence, the second time resolving for import/export is still needed.
   */
  for (const pr of pseudoR.exports as unknown as WorkingPseudoR<ENRERelationExport>[]) {
    if (!pr.resolved) {
      bindExport(pr);
    }
  }

  /**
   * Declarations, imports/exports should all be resolved, that is, the symbol structure should already be built,
   * next working on postponed tasks.
   */
  for (const task of postponedTask.all) {
    if (task.type === 'basic') {
      for (const op of task.payload) {
        if (op.operation === 'add-to-pointsTo') {
          if (op.operand1.type === 'identifier') {
            const found = lookup({
              role: 'value',
              identifier: op.operand1.value,
              at: op.operand0,
            });

            if (found) {
              op.operand0.pointsTo.push(found);
            }
          }
        }
      }
    } else if (task.type === 'stream') {
      let currSymbol: id<ENREEntityCollectionAll> | undefined = undefined;
      for (let i = task.payload.length - 1; i !== -1; i--) {
        const token = task.payload[i];
        switch (token.operation) {
          case 'accessObj': {
            const found = lookup({role: 'value', identifier: token.operand0, at: token.scope}) as id<ENREEntityCollectionAll>;
            if (found) {
              currSymbol = found;
              recordRelationUse(
                token.scope,
                currSymbol,
                token.location,
              );
            }
            break;
          }

          case 'new': {
            const found = lookup({role: 'value', identifier: token.operand0, at: token.scope}) as id<ENREEntityCollectionAll>;
            if (found) {
              currSymbol = found;
              recordRelationCall(
                token.scope,
                currSymbol,
                token.location,
                {isNew: true},
              );
            }
            break;
          }

          case 'call': {
            // A single call expression
            if (currSymbol === undefined) {
              if (token.operand0 === 'super') {
                const classEntity = token.scope.parent as id<ENREEntityClass>;
                const superclass = rGraph.where({
                  from: classEntity,
                  type: 'extend',
                })?.[0].to;
                if (superclass) {
                  // Extend a user-space class
                  if (superclass.id >= 0) {
                    // TODO: This should be a postponed binding after superclass is bound.
                    recordRelationCall(
                      token.scope,
                      superclass,
                      token.location,
                      {isNew: false},
                    );
                  }
                  // Extend a third-party class
                  else {
                    recordRelationCall(
                      token.scope,
                      superclass,
                      token.location,
                      {isNew: false},
                    );
                  }
                }
              }
              // A call to an expression's evaluation result
              else {
                const found = lookup({role: 'value', identifier: token.operand0, at: token.scope}) as id<ENREEntityCollectionAll>;
                if (found) {
                  currSymbol = found;
                  recordRelationCall(
                    token.scope,
                    found,
                    token.location,
                    {isNew: false},
                  );

                  // @ts-ignore
                  for (const pointsTo of found?.pointsTo || []) {
                    recordRelationCall(
                      token.scope,
                      pointsTo,
                      token.location,
                      {isNew: false},
                      // @ts-ignore
                    ).isImplicit = true;
                  }
                }
              }
            } else {
              let found = undefined;
              for (const child of currSymbol.children) {
                if (child.name.codeName === token.operand0) {
                  found = child;
                }
              }

              if (found) {
                recordRelationCall(
                  token.scope,
                  found as id<ENREEntityCollectionAll>,
                  token.location,
                  {isNew: false},
                );
              }

              // TODO: According to function returning type, update currSymbol
              currSymbol = undefined;
            }
            break;
          }

          case 'accessProp': {
            if (currSymbol) {
              let found = undefined;
              for (const child of currSymbol.children) {
                if (child.name.codeName === token.operand0) {
                  found = child;
                }
              }

              if (found) {
                recordRelationUse(
                  token.scope,
                  found as id<ENREEntityCollectionAll>,
                  token.location,
                );
              }
              /**
               * If the prop cannot be found, and its parent has a negative id,
               * it's probably a previously unknown third-party prop,
               * in which case, we should record this prop as an unknown entity.
               */
              else if (currSymbol.id < 0 || (currSymbol.type === 'alias' && currSymbol.ofRelation.to.id < 0)) {
                const unknownProp = recordThirdPartyEntityUnknown(
                  new ENREName('Norm', token.operand0),
                  currSymbol as id<ENREEntityUnknown>,
                  'normal',
                );
                if (i === 0) {
                  // handlers?.last?.(unknownProp, token.location);
                }
                currSymbol = unknownProp;
              } else {
                currSymbol = undefined;
              }
            }
            break;
          }
        }
      }
    }
  }

  for (const pr of pseudoR.all as unknown as WorkingPseudoR<ENRERelationCollectionAll>[]) {
    if (pr.resolved) {
      continue;
    }

    switch (pr.type) {
      case 'call': {
        const pr1 = pr as unknown as WorkingPseudoR<ENRERelationCall>;
        const found = lookup(pr1.to) as id<ENREEntityCollectionAll>;
        if (found) {
          recordRelationCall(
            pr1.from,
            found,
            pr1.location,
            {isNew: false},
          );
          pr1.resolved = true;

          // // @ts-ignore
          // for (const pointsTo of found?.pointsTo || []) {
          //   recordRelationCall(
          //     pr1.from,
          //     pointsTo,
          //     pr1.location,
          //     {isNew: false},
          //     // @ts-ignore
          //   ).isImplicit = true;
          // }
        }

        break;
      }

      case 'set': {
        const pr1 = pr as unknown as WorkingPseudoR<ENRERelationSet>;
        const found = lookup(pr1.to) as id<ENREEntityCollectionAll>;
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
        const found = lookup(pr1.to) as id<ENREEntityCollectionAll>;
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
              found as id<ENREEntityClass>,
              pr1.location,
            );
          } else if (pr1.from.type === 'interface') {
            recordRelationExtend(
              pr1.from,
              found as id<ENREEntityClass> | id<ENREEntityInterface>,
              pr1.location,
            );
          } else if (pr1.from.type === 'type parameter') {
            recordRelationExtend(
              pr1.from,
              found as id<ENREEntityCollectionInFile>,
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
        const found = lookup(pr1.from) as id<ENREEntityCollectionInFile>;
        if (found) {
          recordRelationDecorate(
            found,
            pr1.to as id<ENREEntityCollectionInFile>,
            pr1.location,
          );
          pr.resolved = true;
        }
        break;
      }

      case 'type': {
        const pr1 = pr as unknown as WorkingPseudoR<ENRERelationType>;
        const found = lookup(pr1.from) as id<ENREEntityCollectionInFile>;
        if (found) {
          recordRelationType(
            found,
            pr1.to as id<ENREEntityCollectionInFile>,
            pr1.location,
          );
          pr.resolved = true;
        }
        break;
      }

      case 'implement': {
        const pr1 = pr as unknown as WorkingPseudoR<ENRERelationImplement>;
        const found = lookup(pr1.to) as id<ENREEntityCollectionInFile>;
        if (found) {
          recordRelationImplement(
            pr1.from as id<ENREEntityCollectionInFile>,
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
