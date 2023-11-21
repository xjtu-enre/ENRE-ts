// @ts-nocheck

import {
  ENREEntityClass,
  ENREEntityCollectionAll,
  ENREEntityCollectionInFile,
  ENREEntityFile,
  ENREEntityInterface,
  ENREEntityParameter,
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
  rGraph
} from '@enre/data';
import lookup from './lookup';
import {codeLogger} from '@enre/core';
import bindRepr2Entity from './bind-repr-to-entity';
import {BindingPath} from '../visitors/common/binding-pattern-handler';
import flattenPointsTo from './flatten-pointsto';
import {getRest} from '../visitors/common/literal-handler';
import lookdown from './lookdown';
import {
  AscendPostponedTask,
  DescendPostponedTask
} from '../visitors/common/expression-handler';

type WorkingPseudoR<T extends ENRERelationAbilityBase> = ENREPseudoRelation<T> & {
  resolved: boolean
}

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
  while (iterCount >= 0 || prevUpdated === false) {
    currUpdated = false;
    /**
     * Declarations, imports/exports should all be resolved, that is, the symbol structure should already be built,
     * next working on postponed tasks to resolve points-to relations.
     */
    for (const task of postponedTask.all as [AscendPostponedTask | DescendPostponedTask]) {
      if (task.type === 'ascend') {
        for (const op of task.payload) {
          if (op.operation === 'assign') {
            const resolved = bindRepr2Entity(op.operand1, task.scope);

            for (const bindingRepr of op.operand0) {
              let pathContext = undefined;
              let cursor = [];
              for (const binding of bindingRepr.path) {
                if (binding.type === 'start') {
                  // Simple points-to pass
                  if (resolved.type === 'object') {
                    cursor.push(resolved);
                  }
                  // Failed to resolve
                  else if (resolved.type === 'reference') {
                    // Leave cursor to be empty
                  }
                  // Maybe destructuring, cursor should be JSObjRepr
                  else {
                    // TODO: Find right pointsTo item according to valid range
                    cursor.push(...resolved.pointsTo);
                  }
                } else if (binding.type === 'obj') {
                  pathContext = 'obj';
                } else if (binding.type === 'rest') {
                  cursor = cursor.map(c => getRest(c, binding));
                } else if (binding.type === 'array') {
                  pathContext = 'array';
                } else if (binding.type === 'key') {
                  const _cursor = [];
                  cursor.forEach(c => {
                    let selected = undefined;

                    if (binding.key in c.kv) {
                      selected = c.kv[binding.key];
                    } else if (bindingRepr.default) {
                      selected = bindRepr2Entity(bindingRepr.default, task.scope);
                    }

                    if (selected) {
                      if (selected.type === 'object') {
                        _cursor.push(selected);
                      } else if (selected.type === 'reference') {
                        // Cannot find referenced entity
                      } else {
                        _cursor.push(...selected.pointsTo);
                      }
                    }
                  });
                  cursor = _cursor;
                }
              }

              cursor.map(c => {
                if (!bindingRepr.entity.pointsTo.includes(c)) {
                  bindingRepr.entity.pointsTo.push(c);
                  currUpdated = true;
                }
              });
            }
          }
        }
      } else if (task.type === 'descend') {
        let prevSymbol: any[] | undefined = undefined;
        let currSymbol: any[] = [];

        for (let i = task.payload.length - 1; i !== -1; i -= 1) {
          const token = task.payload[i];
          const nextOperation = task.payload[i - 1]?.operation;

          switch (token.operation) {
            case 'access': {
              // Force override currSymbol and go to the next symbol
              if (token.operand0) {
                currSymbol = token.operand0;
              } else {
                // Access a symbol
                if (prevSymbol === undefined) {
                  // ENREEntity as symbol
                  const found = lookup({
                    role: 'value',
                    identifier: token.operand1,
                    at: task.scope,
                  }) as ENREEntityCollectionAll;

                  if (found) {
                    // ENREEntity as entity for explicit relation
                    currSymbol.push(found);
                  }
                }
                // Access a property of a (previously evaluated) symbol
                else if (prevSymbol.length !== 0) {
                  prevSymbol.forEach(s => {
                    const found = lookdown('name', token.operand1, s);
                    if (found) {
                      // ENREEntity as symbol
                      currSymbol.push(found);
                    }
                  });
                }
                // Try to access a property of a symbol, but the symbol is not found
                else {

                }

                if (prevUpdated === undefined) {
                  // Head token: ENREEntity as entity for explicit relation
                  // Non-head token: ENREEntity as symbol, handled in the next token
                  currSymbol.forEach(s => {
                    if (i === task.payload.length - 1) {
                      if (['call', 'new'].includes(nextOperation)) {
                        recordRelationCall(
                          task.scope,
                          s,
                          token.location,
                          {isNew: nextOperation === 'new'},
                        );
                      } else {
                        recordRelationUse(
                          task.scope,
                          s,
                          token.location,
                        );
                      }
                    }
                  });
                }

                // Hook function should be provided with ENREEntity as symbol
                if (!task.onFinish) {
                  // ENREEntity as symbol (that holds points-to items)
                  currSymbol = currSymbol.map(s => s.pointsTo).reduce((p, c) => [...p, ...c], []);
                  // All symbols' points-to are extracted for the next evaluation
                }

                if (prevUpdated === false) {
                }
              }
              break;
            }

            case 'assign': {
              // prevSymbol is ENREEntity as symbol (due to onFinish hook exists)
              currSymbol = prevSymbol.map(s => s.pointsTo).reduce((p, c) => [...p, ...c], []);
              // currSymbol is JSObjRepr

              currSymbol.forEach(s => {
                // TODO: All kvs should also be array (array should be range-based for path sensitivity)
                // token.operand0 is AccessToken, its operand1 is the property name
                s.kv[token.operand0.operand1] = token.operand1[0];
                currUpdated = true;
              });
              break;
            }

            case 'call':
            case 'new': {
              if (prevSymbol === undefined) {
                // This situation should not be possible in the new data structure
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
                // A normal call that requires name resolution
                else {
                  const found = lookup({
                    role: 'value',
                    identifier: token.operand0,
                    at: task.scope
                  }, true) as ENREEntityCollectionAll;
                  if (found) {
                    if ('pointsTo' in found) {
                      found.pointsTo.forEach(p => {
                        p.callable.forEach(c => {
                          currSymbol.push(c.entity);
                        });
                      });
                    }

                    if (prevUpdated === undefined) {
                      recordRelationCall(
                        task.scope,
                        found,
                        token.location,
                        {isNew: false},
                      );
                    }

                    if (prevUpdated === false) {
                      for (const s of currSymbol) {
                        recordRelationCall(
                          task.scope,
                          s,
                          token.location,
                          {isNew: false},
                        ).isImplicit = true;
                      }
                    } else {
                      // Resolve arg->param points-to
                      for (const [index, arg] of token.operand1.entries()) {
                        const resolved = bindRepr2Entity(arg, task.scope);
                        if (resolved) {
                          // `found` may not be a callable directly
                          let params: ENREEntityParameter[];
                          if (found.type === 'function') {
                            params = found.children.filter(e => e.type === 'parameter') as typeof params;
                          } else {
                            // TODO: Fix hard coded [0]
                            params = flattenPointsTo(found)[0]?.children.filter(e => e.type === 'parameter') as typeof params || [];
                          }
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

                                case 'obj':
                                  pathContext = 'array';
                                  break;

                                case 'key':
                                  if (pathContext === 'param-list') {
                                    if (index.toString() === segment.key) {
                                      cursor = resolved;
                                    }
                                  } else {
                                    // @ts-ignore
                                    cursor = cursor?.kv?.[segment.key];
                                  }
                                  break;
                              }
                            }

                            if (cursor !== undefined) {
                              param.pointsTo.includes(cursor)
                                ? undefined
                                : (param.pointsTo.push(cursor), currUpdated = true);
                            }
                          }
                        }
                      }
                    }

                    // Make function's returns currSymbol for next token
                    currSymbol = [];
                    if ('pointsTo' in found) {
                      found.pointsTo.map(p => {
                        p.callable.map(c => {
                          currSymbol.push(...c.returns);
                        });
                      });
                    }
                  }
                }
              } else if (prevSymbol.length !== 0) {
                prevSymbol.forEach(s => {
                  // TODO: Does prevSymbol holds only JSOBJRepr?
                  // ENREEntity as entity
                  s.callable.forEach(c => currSymbol.push(c.entity));
                });

                if (prevUpdated === false) {
                  currSymbol.forEach(s => {
                    recordRelationCall(
                      task.scope,
                      s,
                      token.location,
                      {isNew: token.operation === 'new'},
                    ).isImplicit = true;
                  });
                }

                // TODO: Pass arguments to parameters
              } else {

              }
              break;
            }
          }

          prevSymbol = currSymbol;
          currSymbol = [];
        }

        if (task.onFinish) {
          task.onFinish(prevSymbol);
          // Make the hook function only be called once
          task.onFinish = undefined;
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
