/**
 * VariableDeclarator
 *
 * Extracted entities:
 *   * Variable
 *
 * Extracted relations:
 *   * Set @init=true
 */

import {NodePath} from '@babel/traverse';
import {ForOfStatement, traverse, TSTypeAnnotation, VariableDeclaration,TSTypeReference, Identifier, TSType, VariableDeclarator} from '@babel/types';
import {
  ENREEntityCollectionAnyChildren,
  ENREEntityClass,
  ENREEntityVariable,
  postponedTask,
  recordEntityVariable,
  recordRelationSet,
  literalTypes
} from '@enre-ts/data';
import {ENRELocation, toENRELocation} from '@enre-ts/location';
import {ENREContext} from '../context';
import traverseBindingPattern from './common/binding-pattern-handler';
import ENREName from '@enre-ts/naming';
import {variableKind} from '@enre-ts/shared';
import resolveJSObj, {JSMechanism, JSObjRepr, createJSObjRepr} from './common/literal-handler';
import expressionHandler, {
  AscendPostponedTask,
  DescendPostponedTask
} from './common/expression-handler';
import _ from 'lodash';
import {Type_is} from './common/binding-pattern-handler';

declare interface raw_type{
  type_id:number,
  type_repr:string,
  type_name:string[],
}
let ID=6;
const buildOnRecord = (kind: variableKind, typeName: string|undefined ,instanceName: string|undefined ,
  hasInit: any,Type:raw_type) => {
  return (name: string, location: ENRELocation, scope: ENREContext['scope']) => {
    const entity = recordEntityVariable(
      new ENREName('Norm', name),
      location,
      scope.last(),
      {kind},
      {typeID:Type.type_id,typeRepr:Type.type_repr,typeName:Type.type_name},
      typeName,
      instanceName
    );

    scope.last<ENREEntityCollectionAnyChildren>().children.push(entity);

    if (!!hasInit) {
      // Record relation `set`
      recordRelationSet(
        scope.last(),
        entity,
        location,
        {isInit: true},
      );

      if(hasInit.kvInitial === 'object'){
        //判断是否设置作用域
        scope.push(entity);
        entity.isValidThis = true;
        isScope = true;
      }

    }

    return entity;
  };
};
type PathType = NodePath<VariableDeclarator>
let isScope:boolean;
export default {
  enter: (path: PathType, {scope, modifiers}: ENREContext) => {
    isScope = false;
    const kind = (path.parent as VariableDeclaration).kind;
    const declarator: VariableDeclarator = path.node as VariableDeclarator;
    let objRepr: JSMechanism | DescendPostponedTask | undefined = resolveJSObj(declarator.init, scope);
    // The init value is not a literal, but an expression.
    let instanceName = undefined;
    if (declarator.init && !objRepr) {
      objRepr = expressionHandler(declarator.init, scope);

      if (declarator.init.type == 'NewExpression'){
        //instanceName = declarator.init.callee.name;
      }
      instanceName = undefined;
    }
    // ForStatement is not supported due to the complexity of the AST structure.
    if (['ForOfStatement', 'ForInStatement'].includes(path.parentPath.parent.type)) {
        objRepr = resolveJSObj((path.parentPath.parent as ForOfStatement).right);
        if (objRepr && "value" in objRepr){
          postponedTask.add({
          type: 'descend',
          payload: [{
            operation: 'call',
            operand1: createJSObjRepr('array'),
            location: toENRELocation(path.parentPath.parent.loc),
            iterator: true
          },{
            operation: 'access',
            operand1: objRepr.value,
            location: toENRELocation(path.parentPath.parent.loc)
          }],
          scope: scope.last(),
          } as DescendPostponedTask);
        }
    }
    if (["ArrayPattern"].includes(declarator.id.type) && declarator.init?.type === 'Identifier'){
      postponedTask.add({
        type: 'descend',
        payload: [{
          operation: 'call',
          operand1: createJSObjRepr('array'),
          location: toENRELocation(declarator.loc),
          iterator: true
        },{
          operation: 'access',
          operand1: declarator.init.name,
          location: toENRELocation(path.parentPath.parent.loc)
        }],
        scope: scope.last()
        } as DescendPostponedTask);
    }

    const typeAnnotation: TSTypeAnnotation|undefined = Reflect.get(declarator.id, 'typeAnnotation')?.typeAnnotation;
    // const typeName = Reflect.get(typeAnnotation, 'typeName').name
    const typeName = undefined;
    // if (typeAnnotation){
    //     typeName = Reflect.get(typeAnnotation, 'typeName').name
    // }
    // const typeName = typeAnnotation?.typeName?.name ?? undefined;

    let annotation;
    if ('typeAnnotation' in declarator.id) {
      annotation = (declarator.id.typeAnnotation as TSTypeAnnotation).typeAnnotation;
    }
    const types=Type_is(annotation,ID);
    if(types.type_id>=ID)ID+=1;

    // 未进行类型注解
    // TODO: 查看objRepr的各种情况
    if ( types.type_name.length === 0 && objRepr ){
      if ( literalTypes.includes(objRepr.type)){
        types.type_name.push(objRepr.type);
      } else if(objRepr.type === 'object'){
        const OBJ_name='object';
        // for(let i=0;i<objRepr.kv;i++){
        //
        // }
        types.type_name.push(OBJ_name);
      }
    }

    const returned = traverseBindingPattern<ENREEntityVariable>(
        declarator.id,
        scope,
        undefined,
        buildOnRecord(kind as variableKind, typeName, instanceName, objRepr, types),
    );
    // returned[0].entity.pointsTo.push(createJSObjRepr('obj'));
    if (returned && objRepr) {
        let variant: 'for-of' | 'for-await-of' | 'for-in' | undefined = undefined;
    if (path.parentPath.parent.type === 'ForOfStatement') {
        variant = 'for-of';
        if (path.parentPath.parent.await) {
            variant = 'for-await-of';
        }
    } else if (path.parentPath.parent.type === 'ForInStatement') {
        variant = 'for-in';
    }
    if ('callable' in objRepr){
        objRepr.callable.push({
        entity: undefined,
        returns: [returned[0].entity],
      });
      objRepr.getEntityName = function(){
        return returned[0].entity.getQualifiedName();
      }
    }

    // 确保 objRepr.callable 是一个数组
    // if (!('callable' in objRepr)) {
    //   objRepr.callable = [];
    // }
    // objRepr.callable.push({
    //   entity: returned[0].entity,
    //   returns: [returned[0].entity],
    // });

    if (objRepr.type === 'descend') {
        objRepr.onFinish = (resolvedResult) => {
        if (resolvedResult.length >= 1) {
            postponedTask.add({
            type: 'ascend',
            payload: [{
                operation: 'assign',
                operand0: returned,
                // FIXME: Temporary only pass one resolved element, but it should be an array.
                operand1: resolvedResult[0],
                variant,
            }]
            } as AscendPostponedTask);

            return true;
        } else {
            return false;
        }
        };
    } else {
        postponedTask.add({
        type: 'ascend',
        payload: [{
            operation: 'assign',
            operand0: returned,
            operand1: objRepr,
            op1Propagation: _.cloneDeep(objRepr),
            variant,
        }],
        scope: scope.last(),
        } as AscendPostponedTask);
        if (path.parentPath.parent.type === 'BlockStatement'){
          objRepr.isBranch = true;
        }
      }
    }

    /**
     * Setup to extract properties from object literals,
     * which expects id to be an identifier.
     *
     * (BindingPattern will be supported by hidden dependency extraction.)
     */
    // if (declarator.id.type === 'Identifier') {
    //   if (declarator.init?.type === 'ObjectExpression') {
    //     if (returned) {
    //       scope.push(returned);

    //       const key = `${path.node.loc!.start.line}:${path.node.loc!.start.column}`;
    //       modifiers.set(key, ({
    //         type: ModifierType.acceptProperty,
    //         proposer: returned,
    //       }));
    //     }
    //   }
    // }
  },

  exit: (path: PathType, {scope, modifiers}: ENREContext) => {
    //console.log('exit var');
    if(scope.last().type === 'variable' && isScope){
      scope.pop();
    }
    // const varEntity = scope.last<ENREEntityClass>();
    // if (varEntity.pointsTo[0].callable.length === 0) {
    //   varEntity.pointsTo[0].callable.push({
    //     entity: varEntity,
    //     /**
    //      * Temporary assign the return value of a new call to a class to be itself.
    //      * TODO: Truly resolve the return value of a new call to a class with the respect
    //      * of constructor's return value.
    //      */
    //     returns: [varEntity],
    //   });
    // }
    // const length = path.node.declarations.length;
    // for (let i = 0; i < length; i++) {
    //     scope.pop();
    // }
    // for (const declarator of path.node.declarations) {
    //   if(declarator.init){
    //     scope.pop()
    //   }
    // }
    // scope.pop();
    // const varEntity = scope.last<ENREEntityClass>();
    // varEntity.children.forEach(f => {
    //   if(f.type === 'function' || f.type === 'method'){
    //     varEntity.pointsTo[0].callable.push({
    //       entity: f,
    //       /**
    //        * Temporary assign the return value of a new call to a class to be itself.
    //        * TODO: Truly resolve the return value of a new call to a class with the respect
    //        * of constructor's return value.
    //        */
    //       returns: [f],
    //     });
    //   }
    // })
    // if (path.node.declarator.id.type === 'Identifier') {
    //   if (declarator.init?.type === 'ObjectExpression') {
    //   }
    // }
    // const key = `${path.node.loc!.start.line}:${path.node.loc!.start.column}`;
    // modifiers.delete(key);
  }
};
