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
    objRepr.callable.push({entity, returns: []});
    entity.pointsTo.push(objRepr);

    scope.last<ENREEntityCollectionAnyChildren>().children.push(entity);
    scope.push(entity);

    parameterHandler(path.node, scope, logs);
  },

  exit: (path: PathType, {scope}: ENREContext) => {
    scope.pop();
  }
};
