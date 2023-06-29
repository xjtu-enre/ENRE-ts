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
import {
  ENREEntityCollectionAnyChildren,
  ENREEntityParameter,
  recordEntityFunction,
  recordEntityParameter
} from '@enre/data';
import {ENRELocation, toENRELocation} from '@enre/location';
import ENREName from '@enre/naming';
import {ENREContext} from '../context';
import traverseBindingPattern from './common/traverseBindingPattern';

const onRecord = (name: string, location: ENRELocation, scope: ENREContext['scope']) => {
  return recordEntityParameter(
    new ENREName('Norm', name),
    location,
    scope.last(),
    {path: ''},
  );
};

type PathType = NodePath<ArrowFunctionExpression>

export default {
  enter: (path: PathType, {scope}: ENREContext) => {
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

    for (const param of path.node.params) {
      traverseBindingPattern<ENREEntityParameter>(
        param,
        scope,
        onRecord,
      );
    }
  },

  exit: (path: PathType, {scope}: ENREContext) => {
    scope.pop();
  }
};
