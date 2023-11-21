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

              cursor.forEach(c => {
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
                let currSymbolHoldsENREEntity = true;

                // Access a symbol
                if (prevSymbol === undefined) {
                  // Special variables are resolved with the top priority
                  // arguments - function's arguments
                  if (token.operand1 === 'arguments') {
                    currSymbolHoldsENREEntity = false;
                    if (task.scope.arguments) {
                      currSymbol.push(...task.scope.arguments);
                      // currSymbol - JSObjRepr
                    }
                  }
                  // Not special variables, go into the normal name lookup procedure
                  else {
                    // ENREEntity as symbol
                    const found = lookup({
                      role: 'value',
                      identifier: token.operand1,
                      at: task.scope,
                    }, true) as ENREEntityCollectionAll;

                    if (found) {
                      // ENREEntity as entity for explicit relation
                      currSymbol.push(found);
                    }
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
                } else {
                  // Try to access a property of a symbol, but the symbol is not found
                }

                if (currSymbolHoldsENREEntity) {
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
                  if (!(task.onFinish && i === 0)) {
                    /**
                     * CurrSymbol - ENREEntity as symbol (that holds points-to items)
                     * or JSObjRepr
                     */
                    currSymbol = currSymbol.map(s => s.pointsTo ?? [s])
                      .reduce((p, c) => [...p, ...c], []);
                    // All symbols' points-to are extracted for the next evaluation
                  }
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
              } else if (prevSymbol.length !== 0) {
                prevSymbol.forEach(s => {
                  // TODO: Does prevSymbol holds only JSOBJRepr?
                  s.callable.forEach(c => currSymbol.push(c.entity));
                  // ENREEntity as entity
                });

                if (prevUpdated === false) {
                  currSymbol.forEach(s => {
                    /**
                     * If the reference chain is
                     * ENREEntity as symbol
                     * -> .pointsTo.callable.entity ENREEntity as entity
                     * where two ENREEntities are the same, then the call relation should
                     * be considered as an explicit relation, which was recorded in the
                     * previous 'access' token.
                     */
                    if (rGraph.where({
                      from: task.scope,
                      to: s,
                      type: 'call',
                      startLine: token.location.start.line,
                      startColumn: token.location.start.column,
                    }).length === 0) {
                      recordRelationCall(
                        task.scope,
                        s,
                        token.location,
                        {isNew: token.operation === 'new'},
                      ).isImplicit = true;
                    }
                  });
                } else {
                  // Resolve arg->param points-to
                  const argRepr = bindRepr2Entity(token.operand1, task.scope);

                  const params: ENREEntityParameter[] = [];
                  currSymbol.forEach(s => {
                    // To support `arguments` special variable usage
                    if (s.arguments) {
                      if (!s.arguments.includes(argRepr)) {
                        s.arguments.push(argRepr);
                        currUpdated = true;
                      }
                    } else {
                      s.arguments = [argRepr];
                      currUpdated = true;
                    }

                    params.push(...s.children.filter(e => e.type === 'parameter'));
                  });

                  for (const param of params) {
                    let cursor = [];
                    let pathContext = undefined;
                    for (const segment of param.path as BindingPath) {
                      switch (segment.type) {
                        case 'array':
                          // Parameter destructuring path starts from 'array' (not 'start')
                          if (pathContext === undefined) {
                            pathContext = 'param-list';
                            cursor.push(argRepr);
                          } else {
                            pathContext = 'array';
                          }
                          break;

                        case 'obj':
                          pathContext = 'array';
                          break;

                        case 'rest':
                          cursor = cursor.map(c => getRest(c, segment));
                          break;

                        case 'key': {
                          /**
                           * Workaround: Use the default value of a parameter no matter
                           * whether it has/has not correlated argument. This behavior is
                           * adopted by PyCG, we manually add an empty object with the `kv`
                           * field, so that the default value can always be used.
                           */
                          cursor.push({kv: {}});

                          const _cursor = [];
                          cursor.forEach(c => {
                            let selected = undefined;

                            if (segment.key in c.kv) {
                              selected = c.kv[segment.key];
                            } else if (param.defaultAlter) {
                              selected = bindRepr2Entity(param.defaultAlter, task.scope);
                            }

                            if (selected) {
                              if (selected.type === 'object') {
                                _cursor.push(selected);
                              } else if (selected.type === 'reference') {
                                // Cannot find referenced entity
                              } else if (Array.isArray(selected)) {
                                /**
                                 * The argument is an array, which is the returned
                                 * symbolSnapshot of an expression evaluation.
                                 */
                                selected.forEach(s => {
                                  _cursor.push(...s.pointsTo);
                                });
                              } else {
                                _cursor.push(...selected.pointsTo);
                              }
                            }
                          });
                          cursor = _cursor;
                          break;
                        }
                      }
                    }

                    cursor.forEach(c => {
                      if (!param.pointsTo.includes(c)) {
                        param.pointsTo.push(c);
                        currUpdated = true;
                      }
                    });
                  }
                }

                // Make function's returns currSymbol for next token
                currSymbol = [];
                prevSymbol.forEach(s => {
                  s.callable.forEach(c => {
                    // c.returns - ENREEntity as symbol
                    c.returns.forEach(r => {
                      if (task.onFinish && i === 0) {
                        currSymbol.push(r);
                      } else {
                        currSymbol.push(...r.pointsTo);
                      }
                    });
                    // ENREEntity as symbol
                  });
                });
              } else {
                // The callable is not found
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
