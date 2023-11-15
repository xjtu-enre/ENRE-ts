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
import {ENREEntityCollectionAnyChildren, recordEntityFunction} from '@enre/data';
import {toENRELocation} from '@enre/location';
import ENREName from '@enre/naming';
import {ENREContext} from '../context';
import parameterHandler from './common/parameter-handler';

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

    scope.last<ENREEntityCollectionAnyChildren>().children.push(entity);
    scope.push(entity);

    parameterHandler(path.node, scope, logs);
  },

  exit: (path: PathType, {scope}: ENREContext) => {
    scope.pop();
  }
};
