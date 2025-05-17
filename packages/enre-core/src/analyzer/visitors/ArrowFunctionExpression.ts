/**
 * ArrowFunctionDeclaration
 *
 * Extracted entities:
 *   * Function
 *     + (Only) Arrow Function
 *   * Parameter
 */

import {NodePath} from '@babel/traverse';
import {ArrowFunctionExpression} from '@babel/types';
import {ENREEntityCollectionAnyChildren, recordEntityFunction} from '@enre-ts/data';
import {toENRELocation} from '@enre-ts/location';
import ENREName from '@enre-ts/naming';
import {ENREContext} from '../context';
import parameterHandler from './common/parameter-handler';
import {createJSObjRepr} from './common/literal-handler';
import expressionHandler from './common/expression-handler';
type PathType = NodePath<ArrowFunctionExpression>

export default {
  enter: (path: PathType, {file: {logs}, scope}: ENREContext) => {
    const entity = recordEntityFunction(
      new ENREName<'Anon'>('Anon', 'ArrowFunction'),
      toENRELocation(path.node.loc),
      scope.last(),
      {
        isArrowFunction: true,
        isAsync: path.node.async,
        isGenerator: path.node.generator,
      }
    );

    const objRepr = createJSObjRepr('obj');
    const ret = [];
    if (path.node)
    objRepr.callable.push({entity, returns: []});
    entity.pointsTo.push(objRepr);
    objRepr.getEntityName = function(){
      return entity.getQualifiedName();
    };
    scope.last<ENREEntityCollectionAnyChildren>().children.push(entity);
    scope.push(entity);
    //处理箭头函数内部的函数调用，还需要进行参数处理
    if (path.node.body.type === 'CallExpression'){
      expressionHandler(path.node.body, scope)
    }
    parameterHandler(path.node, scope, logs);
  },

  exit: (path: PathType, {scope}: ENREContext) => {
    scope.pop();
  }
};
