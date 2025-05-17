/**
 * ClassProperty|ClassPrivateProperty
 *
 * Extracted entities:
 *   * Field
 *   * Method
 */

import {NodePath} from '@babel/traverse';
import {ClassPrivateProperty, ClassProperty, Identifier,TSTypeAnnotation, PrivateName} from '@babel/types';
import {ENREEntityClass, ENREEntityCollectionAnyChildren, ENREEntityField, ENRELogEntry, id, postponedTask, recordEntityField, recordRelationSet} from '@enre-ts/data';
import {ENRELocation, toENRELocation, ToENRELocationPolicy} from '@enre-ts/location';
import ENREName from '@enre-ts/naming';
import {ENREContext} from '../context';
import {Type_is} from './common/binding-pattern-handler';
import expressionHandler, { AscendPostponedTask, DescendPostponedTask } from './common/expression-handler';
import resolveJSObj, {JSMechanism, JSObjRepr, createJSObjRepr} from './common/literal-handler';
import traverseBindingPattern from './common/binding-pattern-handler';
let field_ID=6;
type PathType = NodePath<ClassProperty | ClassPrivateProperty>

const buildOnRecord = (entity: ENREEntityField,
  hasInit: any) => {
  return (name: string, location: ENRELocation, scope: ENREContext['scope']) => {
    // const entity = recordEntityField(
    //   new ENREName('Norm', name),
    //   location,
    //   scope.last(),
    //   // private,public
    //   {}
    // );

    // scope.last<ENREEntityCollectionAnyChildren>().children.push(entity);

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
        // isScope = true;
      }

    }

    return entity;
  };
};
export default (path: PathType, {file: {lang, logs}, scope}: ENREContext) => {
  const key = path.node.key;

  let entity: ENREEntityField | undefined;
  //获得raw_type
  let annotation;
  if ('typeAnnotation' in path.node) {
    annotation = (path.node.typeAnnotation as TSTypeAnnotation).typeAnnotation;
  }
  const types=Type_is(annotation,field_ID);
  if(types.type_id>=field_ID)field_ID+=1;

  // @ts-ignore
  if (path.node.abstract && !scope.last<ENREEntityClass>().isAbstract) {
    logs.add(path.node.loc!.start.line, ENRELogEntry['Abstract fields can only appear within an abstract class']);
    return;
  }

  if (path.node.type === 'ClassPrivateProperty') {
    // @ts-ignore
    if (path.node.accessibility) {
      logs.add(path.node.loc!.start.line, ENRELogEntry['An accessibility modifier cannot be used with a private identifier']);
      return;
    }
    // @ts-ignore
    if (path.node.abstract) {
      logs.add(path.node.loc!.start.line, ENRELogEntry['abstract modifier cannot be used with a private identifier']);
      return;
    }

    entity = recordEntityField(
      new ENREName<'Pvt'>('Pvt', (key as PrivateName).id.name),
      toENRELocation(key.loc, ToENRELocationPolicy.PartialEnd),
      scope.last<ENREEntityClass>(),
      {
        isStatic: path.node.static,
        isPrivate: true,
        typeID:types.type_id,
        typeRepr:'',
        typeName:types.type_name,
      }
    );
  } else {
    if (path.node.abstract) {
      if (path.node.accessibility === 'private') {
        // Only `private` modifier is disabled for abstract field.
        logs.add(path.node.loc!.start.line, ENRELogEntry['0 modifier cannot be used with 1 modifier'], 'private', 'abstract');
        return;
      }

      if (path.node.static) {
        logs.add(path.node.loc!.start.line, ENRELogEntry['0 modifier cannot be used with 1 modifier'], 'static', 'abstract');
        return;
      }
    }

    switch (key.type) {
      case 'Identifier':
        entity = recordEntityField(
          new ENREName('Norm', key.name),
          toENRELocation(key.loc),
          scope.last<ENREEntityClass>(),
          {
            isStatic: path.node.static ?? false,
            isAbstract: path.node.abstract ?? false,
            typeID:types.type_id,
            typeRepr:'',
            typeName:types.type_name,
            TSVisibility: path.node.accessibility ?? (lang === 'ts' ? 'public' : undefined),
          }
        );
        break;
      case 'StringLiteral':
        entity = recordEntityField(
          new ENREName<'Str'>('Str', key.value),
          toENRELocation(key.loc),
          scope.last<ENREEntityClass>(),
          {
            isStatic: path.node.static ?? false,
            isAbstract: path.node.abstract ?? false,
            typeID:types.type_id,
            typeRepr:'',
            typeName:types.type_name,
            TSVisibility: path.node.accessibility ?? (lang === 'ts' ? 'public' : undefined),
          },
        );
        break;
      case 'NumericLiteral':
        entity = recordEntityField(
          new ENREName<'Num'>('Num', key.extra?.raw as string, key.value),
          toENRELocation(key.loc),
          scope.last<ENREEntityClass>(),
          {
            isStatic: path.node.static ?? false,
            isAbstract: path.node.abstract ?? false,
            typeID:types.type_id,
            typeRepr:'',
            typeName:types.type_name,
            TSVisibility: path.node.accessibility ?? (lang === 'ts' ? 'public' : undefined),
          },
        );
        break;
      default:
      // WONT-FIX: Extract name from a lot of expression kinds.
    }
  }

  if (entity) {
    scope.last<ENREEntityField>().children.push(entity);
    // scope.last<ENREEntityClass>().pointsTo[0].kv[entity.name.codeName] = objRepr;
    // handle the assignment/initial of classproperty
    let objRepr: JSMechanism | DescendPostponedTask | undefined = resolveJSObj(path.node.value);
    // The init value is not a literal, but an expression.
    if (path.node.value && !objRepr) {
      objRepr = expressionHandler(path.node.value, scope);
    }
    const returned = traverseBindingPattern<ENREEntityField>(
      path.node.key as Identifier,
      scope,
      undefined,
      buildOnRecord(entity, objRepr),
  );
    if (objRepr){
      if ('callable' in objRepr){
          objRepr.callable.push({
          entity: undefined,
          returns: [returned[0].entity],
        });
        objRepr.getEntityName = function(){
          return returned[0].entity.getQualifiedName();
        }
      }
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
          payload: [
            // {
            //   operation: 'assign',
            //   operand0: ,
            //   operand1: ,
            // },
            // {
            //   operation: 'access',
            //   operand0: objRepr
            // }
            {
              operation: 'assign',
              operand0: returned,
              operand1: objRepr,
            }
          ],
          scope: scope.last(),
          onFinish: (resolvedResult: any) =>{
            // 回调函数，将解析的赋值结果与obj类型合并
            // scope.last<ENREEntityClass>().pointsTo[0].kv[entity.name.codeName] = resolvedResult;
            return true;
          }
          } as AscendPostponedTask);
      }
      //expressionHandler(path.node, scope);
      }

    }
};
