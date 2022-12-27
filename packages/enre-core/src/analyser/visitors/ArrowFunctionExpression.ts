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
  ENREEntityCollectionInFile,
  ENREEntityParameter,
  recordEntityFunction,
  recordEntityParameter
} from '@enre/container';
import {ENRELocation, toENRELocation} from '@enre/location';
import {verbose} from '@enre/logging';
import {buildENREName, ENRENameAnonymous} from '@enre/naming';
import {ENREContext} from '../context';
import traverseBindingPattern from './common/traverseBindingPattern';
import {lastOf} from '../context/scope';

const onRecord = (name: string, location: ENRELocation, scope: ENREContext['scope']) => {
  return recordEntityParameter(
    buildENREName(name),
    location,
    lastOf(scope),
  );
};

const onLog = (entity: ENREEntityParameter) => {
  verbose('Record Entity Parameter: ' + entity.name.printableName);
};

export default ({scope}: ENREContext) => {
  return {
    enter: (path: NodePath<ArrowFunctionExpression>) => {
      const entity = recordEntityFunction(
        buildENREName<ENRENameAnonymous>({as: 'ArrowFunction'}),
        toENRELocation(path.node.loc),
        lastOf(scope),
        {
          isArrowFunction: true,
          isAsync: path.node.async,
          isGenerator: path.node.generator,
        }
      );
      verbose('Record Entity Function (arrow): ' + entity.name.printableName);

      (lastOf(scope).children as ENREEntityCollectionInFile[]).push(entity);
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

    exit: () => {
      scope.pop();
    }
  };
};
