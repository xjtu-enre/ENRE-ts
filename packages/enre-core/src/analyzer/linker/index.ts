import {
  ENREEntityClass,
  ENREEntityCollectionAll,
  ENREEntityCollectionInFile,
  ENREEntityFile,
  ENREEntityInterface,
  ENREEntityParameter,
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
import bindRepr2Entity from './bind-repr-to-entity';
import lookdown from './lookdown';
import {getRest} from '../visitors/common/resolveJSObj';
import {BindingPath} from '../visitors/common/traverseBindingPattern';

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

  let iterCount = 10;
  /**
   * prevUpdated
   *   - Indicate whether the previous iteration updated points-to relations, its value can only be set by the loop and
   *     always is the previous iteration's `currUpdated`.
   * currUpdated
   *   - Indicate whether the current iteration updates points-to relations, can be set in this iteration.
   *
   * States:
   * 0. prev = undefined && curr = undefined
   *    > The initial state of the first iteration.
   * 1. The first iteration
   *    > **Bind explicit relations**
   *    a. prev = undefined && curr = (undefined->)true
   *       - The first iteration updates points-to relations.
   *    b. prev = undefined && curr = (undefined->)false
   *       - The first iteration does not update any points-to relations.
   * 2. Intermediate iteration
   *    > Propagate points-to relations, **no relations are bound in this state**.
   *    a. prev = true && curr = true
   *       - An intermediate iteration that updates points-to relations.
   *    b. prev = true && curr = false
   *       - An intermediate iteration that does not update points-to relations, and iteration ends.
   * 3. prev = false
   *    > The last iteration, **bind implicit relations** based on points-to relations.
   */
  let prevUpdated = undefined, currUpdated = undefined;
  // @ts-ignore
  while (iterCount >= 0 || prevUpdated === false) {
    currUpdated = false;
    /**
     * Declarations, imports/exports should all be resolved, that is, the symbol structure should already be built,
     * next working on postponed tasks to resolve points-to relations.
     */
    for (const task of postponedTask.all) {
      if (task.type === 'ascend') {
        for (const op of task.payload) {
          if (op.operation === 'assign') {
            const resolved = bindRepr2Entity(op.operand1, task.scope);

            for (const bindingRepr of op.operand0) {
              let pathContext = undefined;
              let cursor = undefined;
              for (const binding of bindingRepr.path) {
                if (binding.type === 'start') {
                  // Simple points-to pass
                  if (bindingRepr.path.length === 1 || resolved.type === 'object') {
                    cursor = resolved;
                  }
                  // Maybe destructuring, cursor should be JSObjRepr
                  else {
                    // TODO: Evaluate all pointsTo relations
                    // TODO: Find right pointsTo item according to valid range
                    cursor = resolved.pointsTo[0];
                  }
                } else if (binding.type === 'obj') {
                  pathContext = 'obj';
                } else if (binding.type === 'rest') {
                  cursor = getRest(cursor, binding);
                } else if (binding.type === 'array') {
                  pathContext = 'array';
                } else if (binding.type === 'key') {
                  if (cursor === undefined) {
                    break;
                  } else if (pathContext === 'obj') {
                    if (binding.key in cursor.kv) {
                      cursor = cursor.kv[binding.key];
                    } else if (bindingRepr.default) {
                      cursor = bindRepr2Entity(bindingRepr.default, task.scope);
                    } else {
                      cursor = undefined;
                    }
                  } else if (pathContext === 'array') {
                    // TODO: Handle custom (async) iterator
                    if (binding.key in cursor.kv) {
                      cursor = cursor.kv[binding.key];
                    } else if (bindingRepr.default) {
                      cursor = bindRepr2Entity(bindingRepr.default, task.scope);
                    } else {
                      cursor = undefined;
                    }
                  }
                }
              }
              bindingRepr.entity.pointsTo.includes(cursor)
                ? undefined
                : (bindingRepr.entity.pointsTo.push(cursor), currUpdated = true);
            }
          }
        }
      } else if (task.type === 'descend') {
        let currSymbol: ENREEntityCollectionAll | undefined = undefined;
        for (let i = task.payload.length - 1; i !== -1; i--) {
          const token = task.payload[i];
          switch (token.operation) {
            case 'accessObj': {
              const found = lookup({
                role: 'value',
                identifier: token.operand0,
                at: task.scope
              }) as ENREEntityCollectionAll;
              if (found) {
                currSymbol = found;

                if (prevUpdated === undefined) {
                  recordRelationUse(
                    task.scope,
                    currSymbol,
                    token.location,
                  );
                } else if (prevUpdated === false) {
                  // @ts-ignore
                  for (const pointsTo of currSymbol?.pointsTo || []) {
                    recordRelationUse(
                      task.scope,
                      pointsTo,
                      token.location,
                    ).isImplicit = true;
                  }
                }
              }
              break;
            }

            case 'new': {
              const found = lookup({
                role: 'value',
                identifier: token.operand0,
                at: task.scope
              }) as ENREEntityCollectionAll;
              if (found) {
                currSymbol = found;

                if (prevUpdated === undefined) {
                  recordRelationCall(
                    task.scope,
                    currSymbol,
                    token.location,
                    {isNew: true},
                  );
                } else if (prevUpdated === false) {
                  // @ts-ignore
                  for (const pointsTo of currSymbol?.pointsTo || []) {
                    recordRelationCall(
                      task.scope,
                      pointsTo,
                      token.location,
                      {isNew: true},
                    ).isImplicit = true;
                  }
                }
              }
              break;
            }

            case 'call': {
              // A single call expression
              if (currSymbol === undefined) {
                if (token.operand0 === 'super') {
                  const classEntity = task.scope.parent as ENREEntityClass;
                  const superclass = rGraph.where({
                    from: classEntity,
                    type: 'extend',
                  })?.[0].to as id<ENREEntityCollectionAll>;
                  if (superclass) {
                    // Extend a user-space class
                    if (superclass.id >= 0) {
                      // TODO: This should be a postponed binding after superclass is bound.
                      recordRelationCall(
                        task.scope,
                        superclass,
                        token.location,
                        {isNew: false},
                      );
                    }
                    // Extend a third-party class
                    else {
                      recordRelationCall(
                        task.scope,
                        superclass,
                        token.location,
                        {isNew: false},
                      );
                    }
                  }
                }
                // A call to an expression's evaluation result
                else {
                  const found = lookup({
                    role: 'value',
                    identifier: token.operand0,
                    at: task.scope
                  }) as ENREEntityCollectionAll;
                  if (found) {
                    currSymbol = found;

                    if (prevUpdated === undefined) {
                      recordRelationCall(
                        task.scope,
                        found,
                        token.location,
                        {isNew: false},
                      );
                    }

                    if (prevUpdated === false) {
                      // @ts-ignore
                      for (const pointsTo of found?.pointsTo || []) {
                        recordRelationCall(
                          task.scope,
                          pointsTo,
                          token.location,
                          {isNew: false},
                        ).isImplicit = true;
                      }
                    } else {
                      // Resolve arg->param points-to
                      for (const [index, arg] of token.operand1.entries()) {
                        const resolved = bindRepr2Entity(arg, task.scope);
                        if (resolved) {
                          const params = found.children.filter(e => e.type === 'parameter') as ENREEntityParameter[];
                          for (const param of params) {
                            let cursor = undefined;
                            let pathContext = undefined;
                            for (const segment of param.path as BindingPath) {
                              switch (segment.type) {
                                case 'array':
                                  // Parameter destructuring path starts from 'array' (not 'start')
                                  if (pathContext === undefined) {
                                    pathContext = 'param-list';
                                  } else {
                                    pathContext = 'array';
                                  }
                                  break;

                                case 'key':
                                  if (pathContext === 'param-list') {
                                    if (index.toString() === segment.key) {
                                      cursor = resolved;
                                    }
                                  }
                                  break;
                              }
                            }

                            param.pointsTo.includes(cursor)
                              ? undefined
                              : (param.pointsTo.push(cursor), currUpdated = true);
                          }
                        }
                      }
                    }
                  }
                }
              } else {
                // @ts-ignore
                const found = lookdown('name', token.operand0, currSymbol);

                if (found) {
                  if (prevUpdated === undefined) {
                    recordRelationCall(
                      task.scope,
                      found as ENREEntityCollectionAll,
                      token.location,
                      {isNew: false},
                    );
                  } else if (currUpdated === false) {
                    // @ts-ignore
                    for (const pointsTo of found?.pointsTo || []) {
                      recordRelationCall(
                        task.scope,
                        pointsTo,
                        token.location,
                        {isNew: false},
                      ).isImplicit = true;
                    }
                  }
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
                  if (prevUpdated === undefined) {
                    recordRelationUse(
                      task.scope,
                      found as ENREEntityCollectionAll,
                      token.location,
                    );
                  } else if (prevUpdated === false) {
                    // @ts-ignore
                    for (const pointsTo of found?.pointsTo || []) {
                      recordRelationUse(
                        task.scope,
                        pointsTo,
                        token.location,
                      ).isImplicit = true;
                    }
                  }

                }
                /**
                 * If the prop cannot be found, and its parent has a negative id,
                 * it's probably a previously unknown third-party prop,
                 * in which case, we should record this prop as an unknown entity.
                 */
                else if ((currSymbol as id<typeof currSymbol>).id < 0 ||
                  (currSymbol.type === 'alias' && (currSymbol.ofRelation.to as id<ENREEntityCollectionAll>).id < 0)) {
                  const unknownProp = recordThirdPartyEntityUnknown(
                    new ENREName('Norm', token.operand0),
                    currSymbol as ENREEntityUnknown,
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

    // Notice the order of the following state update expressions

    // First count down the iteration counter
    iterCount -= 1;

    // If this iteration is already the last one, then jump out of the loop
    if (prevUpdated === false) {
      break;
    }

    // (If not the last one) Record currUpdated in prevUpdated
    prevUpdated = currUpdated;

    // If the counter is (0->) -1, then set prevUpdated to false for the next iteration to bind implicit relations
    if (iterCount < 0) {
      prevUpdated = false;
    }
  }

  for (const pr of pseudoR.all as unknown as WorkingPseudoR<ENRERelationCollectionAll>[]) {
    if (pr.resolved) {
      continue;
    }

    switch (pr.type) {
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
