/**
 * CatchClause
 *
 * Extracted entities:
 *   * Parameter
 */

import {NodePath} from '@babel/traverse';
import {CatchClause} from '@babel/types';
import {ENREEntityCollectionInFile, ENREEntityParameter, recordEntityParameter} from '@enre/container';
import {ENRELocation} from '@enre/location';
import {verbose} from '@enre/logging';
import {buildENREName} from '@enre/naming';
import {ENREContext} from '../context';
import traverseBindingPattern from './common/traverseBindingPattern';
import {lastOf} from '../context/scope';

const onRecord = (name: string, location: ENRELocation, scope: ENREContext['scope']) => {
  const entity = recordEntityParameter(
    buildENREName(name),
    location,
    scope[scope.length - 1],
  );

  (lastOf(scope).children as ENREEntityCollectionInFile[]).push(entity);

  return entity;
};

const onLog = (entity: ENREEntityParameter) => {
  verbose('Record Entity Parameter (catch): ' + entity.name.printableName);
};

export default ({scope}: ENREContext) => {
  return {
    enter: (path: NodePath<CatchClause>) => {
      // TODO: Add a catch clause middle entity to represent the catch scope
      if (path.node.param) {
        traverseBindingPattern<ENREEntityParameter>(
          path.node.param,
          scope,
          onRecord,
          onLog,
        );
      }
    },

    exit: () => {
      // scope.pop();
    }
  };
};
