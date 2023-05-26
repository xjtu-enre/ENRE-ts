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
import {ENREEntityParameter, recordEntityFunction, recordEntityParameter} from '@enre/container';
import {ENRELocation, toENRELocation} from '@enre/location';
import {verbose} from '@enre/logging';
import {buildENREName, ENRENameAnonymous} from '@enre/naming';
import {ENREContext} from '../context';
import traverseBindingPattern from './common/traverseBindingPattern';
import {ENREEntityCollectionAnyChildren} from '@enre/container/lib/entity/collections';

const onRecord = (name: string, location: ENRELocation, scope: ENREContext['scope']) => {
  return recordEntityParameter(
    buildENREName(name),
    location,
    scope.last(),
  );
};

const onLog = (entity: ENREEntityParameter) => {
  verbose('Record Entity Parameter: ' + entity.name.printableName);
};

type PathType = NodePath<ArrowFunctionExpression>

export default {
  enter: (path: PathType, {scope}: ENREContext) => {
    const entity = recordEntityFunction(
      buildENREName<ENRENameAnonymous>({as: 'ArrowFunction'}),
      toENRELocation(path.node.loc),
      scope.last(),
      {
        isArrowFunction: true,
        isAsync: path.node.async,
        isGenerator: path.node.generator,
      }
    );
    verbose('Record Entity Function (arrow): ' + entity.name.printableName);

    scope.last<ENREEntityCollectionAnyChildren>().children.push(entity);
    scope.push(entity);

    for (const param of path.node.params) {
      traverseBindingPattern<ENREEntityParameter>(
        param,
        scope,
        onRecord,
        onLog,
      );
    }
  },

  exit: (path: PathType, {scope}: ENREContext) => {
    scope.pop();
  }
};
