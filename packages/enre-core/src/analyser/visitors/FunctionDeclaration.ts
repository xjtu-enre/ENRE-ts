/**
 * FunctionDeclaration|FunctionExpression
 *
 * Extracted entities:
 *   * Function
 *     - (Exclude) Arrow Function
 *   * Parameter
 */

import {NodePath} from '@babel/traverse';
import {FunctionDeclaration, FunctionExpression, SourceLocation} from '@babel/types';
import {ENREEntityFunction, ENREEntityParameter, recordEntityFunction, recordEntityParameter} from '@enre/container';
import {ENRELocation, toENRELocation} from '@enre/location';
import {verbose} from '@enre/logging';
import {buildENREName, ENRENameAnonymous} from '@enre/naming';
import {ENREContext} from '../context';
import traverseBindingPattern from './common/traverseBindingPattern';
import {ENREEntityCollectionAnyChildren} from '@enre/container/lib/entity/collections';

const onRecord = (name: string, location: ENRELocation, scope: ENREContext['scope']) => {
  const entity = recordEntityParameter(
    buildENREName(name),
    location,
    scope[scope.length - 1],
  );

  scope.last<ENREEntityFunction>().children.push(entity);

  return entity;
};

const onLog = (entity: ENREEntityParameter) => {
  verbose('Record Entity Parameter: ' + entity.name.printableName);
};

type PathType = NodePath<FunctionDeclaration | FunctionExpression>

export default {
  enter: (path: PathType, {scope}: ENREContext) => {
    let entity: ENREEntityFunction;

    if (path.node.id) {
      entity = recordEntityFunction(
        buildENREName(path.node.id.name),
        /**
         * If it's a named function, use identifier's location as entity location.
         */
        toENRELocation(path.node.id.loc),
        scope.last(),
        {
          isArrowFunction: false,
          isAsync: path.node.async,
          isGenerator: path.node.generator,
        },
      );
    } else {
      entity = recordEntityFunction(
        buildENREName<ENRENameAnonymous>({as: 'Function'}),
        /**
         * If it's an unnamed function,
         * use the start position of this function declaration block
         * as the start position of this entity, and set length to 0.
         *
         * This will also count in `async`.
         */
        toENRELocation(path.node.loc as SourceLocation),
        scope.last(),
        {
          isArrowFunction: false,
          isAsync: path.node.async,
          isGenerator: path.node.generator,
        },
      );
    }
    verbose('Record Entity Function: ' + entity.name.printableName);

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
  },
};
