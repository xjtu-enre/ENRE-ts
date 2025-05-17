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
  rGraph,
  literalTypes
} from '@enre-ts/data';
import lookup from './lookup';
import {codeLogger} from '@enre-ts/core';
import bindRepr2Entity from './bind-repr-to-entity';
import {BindingPath} from '../visitors/common/binding-pattern-handler';
import {getRest} from '../visitors/common/literal-handler';
import lookdown from './lookdown';
import {
  AscendPostponedTask,
  DescendPostponedTask
} from '../visitors/common/expression-handler';
import { ClassHierarchyAnalyzer as CHAnalyzer} from '../callgraph/ClassHierarchyAnalysisAlgorithm';
import { RapidTypeAnalyzer as RTAnalyzer } from '../callgraph/RapidTypeAnalysisAlgorithm';
import { PointerAnalyzer as PTAnalyzer} from '../callgraph/PointerAnalysis';
import { time } from 'console';
// const CHAnalyzer = ClassHierarchyAnalyzer
import _ from 'lodash';


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

  //callgraph
  // CHAnalyzer.processExpr()
  // RTAnalyzer.processExpr()

  // CHAnalyzer.printHierarchy('B')
  // const found = lookup({
  //   role: 'value',
  //   identifier: 'A',
  //   at: task.scope,
  // }, true) as ENREEntityCollectionAll;


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
    for (const [index, task] of Object.entries(postponedTask.all as [AscendPostponedTask | DescendPostponedTask])) {
      try {
        if (task.type === 'ascend') {
          for (const op of task.payload) {
            if (op.operation === 'assign') {
              let resolved = bindRepr2Entity(op.operand1, task.scope);
              

              // let cp_resolved = undefined;
              // if (op.op1Propagation){
              //   bindRepr2Entity(op.op1Propagation, task.scope);
              // }
              if (literalTypes.includes(resolved.type)){
                //literal handle
              }
              else if (resolved.type !== 'object') {
                // literal bug
                resolved = resolved.pointsTo[0];
                // if(cp_resolved){
                //   cp_resolved = cp_resolved.pointsTo[0];
                // }
              }

              for (const bindingRepr of op.operand0) {
                let pathContext = undefined;
                let cursor = [];
                for (const binding of bindingRepr.path) {
                  if (binding.type === 'start') {
                    // Simple points-to pass
                    if (resolved.type === 'object') {
                      if (op.variant === 'for-of') {
                        let values = undefined;

                        if (resolved.callable.iterator) {
                          values = resolved.callable.iterator.pointsTo[0].callable[0].returns;
                        // if (resolved.kv.iterator) {
                        //   values = resolved.kv.iterator.pointsTo[0].callable[0].returns;
                        } else {
                          values = Object.values(resolved.kv);
                        }

                        cursor.push(...values);

                        if (prevUpdated === false) {
                          recordRelationCall(
                            task.scope,
                            resolved.callable.iterator,
                            op.operand1.location,
                            {isNew: false},
                          ).isImplicit = true;
                          // recordRelationCall(
                          //   task.scope,
                          //   resolved.kv.iterator,
                          //   op.operand1.location,
                          //   {isNew: false},
                          // ).isImplicit = true;
                        }
                      } else if (op.variant === 'for-await-of') {
                        let values = undefined;

                        if (resolved.callable.asyncIterator) {
                          values = resolved.callable.asyncIterator.pointsTo[0].callable[0].returns;
                        }
                        // if (resolved.kv.asyncIterator) {
                        //   values = resolved.kv.asyncIterator.pointsTo[0].callable[0].returns;
                        // }

                        cursor.push(...values);

                        if (prevUpdated === false) {
                          recordRelationCall(
                            task.scope,
                            resolved.callable.asyncIterator,
                            op.operand1.location,
                            {isNew: false},
                          ).isImplicit = true;
                          // recordRelationCall(
                          //   task.scope,
                          //   resolved.kv.asyncIterator,
                          //   op.operand1.location,
                          //   {isNew: false},
                          // ).isImplicit = true;
                        }
                      } else if (op.variant === 'for-in') {
                        let values = undefined;

                        // Package string to JSStringLiteral
                        values = Object.keys(resolved.kv).map(k => ({
                          type: 'string',
                          value: k,
                        }));

                        cursor.push(...values);

                        if (prevUpdated === false) {
                          recordRelationUse(
                            task.scope,
                            resolved,
                            op.operand1.location,
                            {isNew: false},
                          );
                        }
                      } else {
                        cursor.push(resolved);
                      }
                    }
                    // Failed to resolve
                    else if (resolved.type === 'reference') {
                      // Leave cursor to be empty
                    }
                    else if (literalTypes.includes(resolved.type)){
                      cursor.push(resolved);
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
                    //!bindingRepr.entity.pointsTo.some(item => _.isEqual(item, c))
                    // TODO: strong update？(hjj)
                    // TODO: 传递原任务的clone?

                    //const obj = _.cloneDeep(c);
                    //bindingRepr.entity.pointsTo.pop();
                    // bindingRepr.entity.pointsTo = bindingRepr.entity.pointsTo.filter
                    // if (obj.isBranch){
                    //   bindingRepr.entity.pointsTo = bindingRepr.entity.pointsTo.filter(item => !item.isBranch)
                    // } else{
                    //   bindingRepr.entity.pointsTo = []
                    // }
                    // bindingRepr.entity.pointsTo.forEach(element => {

                    const obj = c;
                    // });
                    bindingRepr.entity.pointsTo.push(obj);
                    if (obj.typeName){
                      bindingRepr.entity.typeName.push(...obj.typeName);
                    }
                    obj.callable?.forEach(element => {
                      if (element.entity) {
                        if (element.entity.typeName){
                            bindingRepr.entity.typeName.push(...element.entity.typeName);
                        }else if (element.entity.returnType){
                            bindingRepr.entity.typeName.push(...element.entity.returnType);
                        }

                    }
                      element.returns.forEach(t => {
                        bindingRepr.entity.typeName.push(...t.typeName);
                      });
                    });
                    // if(obj.callable[0].returns[0].typeName){
                    //   bindingRepr.entity.typeName.push(...obj.callable[0].returns[0].typeName);
                    // }

                    if (task.onFinish){
                      // task.onFinish(c);
                      task.scope.pointsTo[0].kv[bindingRepr.entity.name.codeName] = obj
                      task.onFinish = undefined;
                    }
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

                    // this - mainly for class methods
                    // FIXME: Currently does not support complex usage (e.g. dynamic this other than class)
                    if (token.operand1 === 'this' || token.operand1 === 'super') {
                      // Simply find a class entity along the scope chain
                      let cursor = task.scope;
                      // while (cursor.type !== 'class' && cursor.type !=='variable') {
                      //   cursor = cursor.parent;
                      //   if (cursor === undefined) {
                      //     break;
                      //   }
                      // }
                      if(cursor.thisPointsTo.length !==0 ){

                        cursor.thisPointsTo.forEach(t => {
                          if (token.operand1 === 'super'){
                            currSymbol.push(t.base);
                          }else{
                            currSymbol.push(t)
                          }
                        })
                      }else{
                        while(!cursor.isValidThis){
                          cursor = cursor.parent;
                          if(cursor === undefined){
                            break;
                          }
                        }
                        if (token.operand1 === 'super'){
                          cursor = cursor.base;
                        }
                        if (cursor) {
                          currSymbol.push(...cursor.pointsTo);
                        }
                      }
                    }
                    // arguments - function's arguments
                    else if (token.operand1 === 'arguments') {
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
                        loc: token.location
                      }, true) as ENREEntityCollectionAll;

                      if (found) {
                        // ENREEntity as entity for explicit relation
                        currSymbol.push(found);
                        if(prevUpdated === false && found.pointsTo.length === 0){
                          let typeCls = lookup({
                            role: 'value',
                            identifier: found.typeName[0],
                            at: task.scope,
                            loc: token.location
                          }, true) as ENREEntityCollectionAll;
                          found.pointsTo.push(...typeCls?.pointsTo);
                        }
                      }
                    }
                  }
                  // Access a property of a (previously evaluated) symbol
                  else if (prevSymbol.length !== 0) {
                    prevSymbol.forEach(s => {
                      let found = undefined;
                      if (token.computed){
                        let value = lookup({
                          role: 'value',
                          identifier: token.operand1,
                          at: task.scope,
                          loc: token.location
                        }, true) as ENREEntityCollectionAll;
                        value?.pointsTo?.forEach(element => {
                          //TODO: 多个赋值情况？（HJJ）
                          if (literalTypes.includes(element.type)){
                            found = lookdown('name', element.value, s)
                          }
                          else {
                            found = undefined
                            //found = lookdown('name', token.operand1, s);
                          }
                        });
                        if(!found){
                          found = lookdown('name', token.operand1, s);
                        }
                        // found = lookdown('name', found.pointsTo[0], s);
                      }
                      else{
                        found = lookdown('name', token.operand1, s);
                      }
                      if (found) {
                        if (found.type === 'receipt'){
                          const subfound = lookup({
                            role: 'value',
                            identifier: token.operand1,
                            at: s.callable[0].returns[0],
                          }, true) as ENREEntityCollectionAll;
                          if (subfound){
                            currSymbol.push(subfound);
                          }
                        }
                        else{
                          if (i === 0){
                            //currSymbol.push(found.callable[0].entity)
                            currSymbol.push(found);
                          }else{
                            // ENREEntity as symbol
                            currSymbol.push(found);
                          }

                        }

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
                            // s is `ENTITY`
                            let Call_to = s;
                            if (task.payload[i - 1]?.iterator){
                              if (s.pointsTo[0]?.callable?.iterator){
                                Call_to = s.pointsTo[0]?.callable?.iterator;
                              }else {
                                return;
                              }
                            }
                            let created = recordRelationCall(
                              task.scope,
                              Call_to,
                              token.location,
                              {isNew: nextOperation === 'new'},
                            );
                            let from = created.from.getQualifiedName()
                            // if(from.endsWith('<Anon Function)') || from.endsWith('<Anon ArrowFunction>')){
                            //   from = from + created.location.start.line + ':' + created.location.start
                            // }
                            let to = created.to.getQualifiedName()

                            // if (!PTAnalyzer.callGraph.has(from)) {
                            //   PTAnalyzer.callGraph.set(from, new Set());
                            // }
                            // PTAnalyzer.callGraph.get(from)?.add(to);
                            PTAnalyzer.add(from, to, created.location, task.payload)
                            console.log('from:'+from+'to:'+to);
                            // to.forEach(edge => PTAnalyzer.callGraph.get(from)?.add(edge))
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
                    if (!(task.onFinish && i === 0)){//|| task.payload.length === 1) {
                      /**
                       * CurrSymbol - ENREEntity as symbol (that holds points-to items)
                       * or JSObjRepr
                       */
                      currSymbol = currSymbol.map(s => s.pointsTo ?? [s])
                        .reduce((p, c) => [...p, ...c], []);
                      // All symbols' points-to are extracted for the next evaluation
                    }
                    // if (task.onFinish){
                    //   const executionSuccess = task.onFinish(prevSymbol);
                    //   if (executionSuccess) {
                    //     // Make the hook function only be called once (If whatever intended was done)
                    //     task.onFinish = undefined;
                    //     currUpdated = true;
                    //   }
                    // }
                  }
                }
                break;
              }

              case 'assign': {
                // prevSymbol is ENREEntity as symbol (due to onFinish hook exists)
                currSymbol = prevSymbol.map(s => s.pointsTo ?? [s]).reduce((p, c) => [...p, ...c], []);
                // currSymbol is JSObjRepr

                const resolved = bindRepr2Entity(token.operand1[0], task.scope);

                if (currSymbol.length === 0) {
                  // This usually happens for code `foo = <...>` rather than `foo.bar = <...>`

                  // ENREEntity as symbol
                  const found = lookup({
                    role: 'value',
                    identifier: token.operand0.operand1,
                    at: task.scope,
                  }, true) as ENREEntityCollectionAll;

                  if (found) {
                    found.pointsTo.push(resolved);
                    if (resolved.typeName){
                      found.typeName.push(...resolved.typeName);
                    }
                    resolved.callable.forEach(element => {
                      if (element.entity){
                        found.typeName.push(...element.entity.typeName);
                      }
                      element.returns.forEach(t => {
                        found.typeName.push(...t.typeName);

                      });
                    });
                    // if (resolved.callable[0].returns[0].typeName){
                    //   found.typeName.push(resolved.callable[0].returns[0].typeName);
                    // }
                    currSymbol = found.pointsTo;
                  }
                } else {
                  currSymbol.forEach(s => {
                    // token.operand0 is AccessToken, its operand1 is the property name
                    if (token.operand0.operand1 === Symbol.iterator) {
                      s.callable.iterator = resolved;
                      //s.kv.iterator = resolved;

                    } else if (token.operand0.operand1 === Symbol.asyncIterator) {
                      s.callable.asyncIterator = resolved;
                      // s.kv.asyncIterator = resolved;

                    } else {
                      if (token.operand0.computed){
                        let value = lookup({
                          role: 'value',
                          identifier: token.operand0.operand1,
                          at: task.scope,
                        }, true) as ENREEntityCollectionAll;
                        if (value.defaultAlter){
                          value = value.defaultAlter;
                        }
                        //TODO:computed condition
                        if (value){
                          s.kv[value.value] = resolved;
                        } else{
                          s.kv[token.operand0.operand1] = resolved;
                        }
                      } else {
                      s.kv[token.operand0.operand1] = resolved;
                      }
                    }
                    currUpdated = true;
                  });
                }
                break;
              }

              case 'call':
              case 'new': {
                if (prevSymbol === undefined) {
                  // This situation should not be possible in the new data structure
                  // Call/New token cannot be the first token of a task
                } else if (prevSymbol.length !== 0) {
                  prevSymbol.forEach(s => {
                    // TODO: Does prevSymbol holds only JSOBJRepr?
                    if (token.iterator){
                      s.callable.iterator && currSymbol.push(s.callable.iterator);
                    }else {
                      if (s.type === 'object') {
                      s.callable.forEach(c => currSymbol.push(c.entity));
                    } else {
                      currSymbol.push(s);
                    }
                    // ENREEntity as entity
                    }

                  });

                  if (prevUpdated === false){// || (token.lastSymbol && !(_.isEqual(currSymbol, token.lastSymbol)))) {
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
                        // recordRelationCall(
                        //   task.scope,
                        //   s,
                        //   token.location,
                        //   {isNew: token.operation === 'new'},
                        // ).isImplicit = true;
                        let created = recordRelationCall(
                          task.scope,
                          s,
                          token.location,
                          {isNew: token.operation === 'new'},
                        );
                        created.isImplicit = true;
                        let from = created.from.getQualifiedName()
                        let to = created.to.getQualifiedName()
                        PTAnalyzer.add(from, to, created.location, task)
                        // if (!PTAnalyzer.callGraph.has(from)) {
                        //   PTAnalyzer.callGraph.set(from, new Set());
                        // }
                        // PTAnalyzer.callGraph.get(from)?.add(to)
                        // to.forEach(edge => PTAnalyzer.callGraph.get(from)?.add(edge))
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
                      // let cursor = s;
                      // while(!cursor.isValidThis){
                      //   cursor = cursor.parent;
                      //   if(cursor === undefined){
                      //     break;
                      //   }
                      // }
                      if(task.payload[i+2]){//call 传入obj 参数， 模式：obj.func(), 讲obj对应的pointsTo传入func()中的this参数
                        let cursor = task.payload[i+2].lastSymbol;
                        if (cursor.length !== 0){
                          cursor.forEach(p => {
                            if (p.callable){
                              p.callable.forEach( r => {
                                if (!s.thisPointsTo.includes(r.entity)) {
                                  s.thisPointsTo.push(r.entity);
                                }      
                              });
                            }
                            
                          });
                        }
                      }

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
                            cursor?.forEach(c => {
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
                                    if (s.pointsTo){
                                      _cursor.push(...s.pointsTo);
                                    }else{
                                      s.callable.forEach(e =>{
                                        _cursor.push(...(e.entity.pointsTo))
                                      })
                                    }
                                  });
                                } else if (literalTypes.includes(selected.type)){
                                  // TODO: literal
                                  //param.typeName.push(selected.type);

                                  if (!param.typeName.includes(selected.type)){
                                    param.typeName.push(selected.type)
                                  }
                                  _cursor.push(selected);
                                } else{
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
                          if (c.typeName){
                            param.typeName.push(...c.typeName);
                          }
                          c.callable?.forEach(element => {
                            if(element.entity){
                              param.typeName.push(...element.entity.typeName);
                            }
                            element.returns.forEach(t => {
                              param.typeName.push(...t.typeName);
                            });
                          });
                          // if(c.callable[0].returns[0].typeName){
                          //   param.typeName.push(c.callable[0].returns[0].typeName);
                          // }
                          currUpdated = true;
                        }
                      });
                    }
                  }


                  // Make function's returns currSymbol for next token
                  currSymbol = [];
                  prevSymbol.forEach(s => {
                    s.callable?.forEach(c => {
                      // c.returns - ENREEntity as symbol
                      c.returns.forEach(r => {
                        if (task.onFinish && i === 0) {
                          if(r.pointsTo){
                            currSymbol.push(...r.pointsTo);
                          }else{
                            currSymbol.push(r);
                          }

                        } else {
                          if(r.pointsTo){
                            currSymbol.push(...r.pointsTo);
                          }
                          //currSymbol.push(...r.pointsTo);
                        }
                      });
                      // ENREEntity as symbol
                    });
                  });
                }
                break;
              }
            }

            prevSymbol = currSymbol;
            currSymbol = [];
            task.payload[i].lastSymbol = prevSymbol
            // if('lastSymbol' in task.payload[i]){

            // }else{
            //   task.payload[i].lastSymbol = prevSymbol
            // }
          }

           if (task.onFinish) {

            const executionSuccess = task.onFinish(prevSymbol, Number(index) + 1);
            // && (_.isEqual(prevSymbol, token.lastSymbol))
            /**
             * FIXME: The arguments of hook call should be memo-ed, so that the next time
             * the dependency data was updated, the hook function should be called again.
             *
             * Now for simplicity, the hook function is only called once, so that it loses
             * any data update.
             *
             * The explicit return value of `true/false` is only a temporary workaround,
             * ideally the argument memo mechanism and the hook update mechanism should be
             * implemented. (Leave it to the next maintainer, hope you can do it :)
             */
            if (executionSuccess) {
              // Make the hook function only be called once (If whatever intended was done)
              task.onFinish = undefined;
              currUpdated = true;
            }
          }
        }
      } catch(error) {
         // 输出错误信息
        codeLogger.error(`Error details: ${error.message}`);  // 错误的消息
        codeLogger.error(`Stack trace: ${error.stack}`);      // 错误的堆栈信息
        if (task.scope) {
          const filePath = task.scope.type === 'file' ? task.scope.path : task.scope.getSourceFile().path;
          codeLogger.error(`Points-to relation resolving is experimental, and it fails at ${filePath} (Task ${index}/${postponedTask.all.length})`);
        } else {
          codeLogger.error(`Points-to relation resolving is experimental, and it fails at unknown (Task ${index}/${postponedTask.all.length})`);
        }
      }
    }

    // Notice the order of the following state update expressions

    // First count down the iteration counter
    iterCount -= 1;

    console.log('iterCount=' + iterCount);
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
