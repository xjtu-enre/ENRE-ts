/**
 * CatchClause
 *
 * Extracted entities:
 *   * Parameter
 */

import {NodePath} from '@babel/traverse';
import {CatchClause} from '@babel/types';
import {ENREEntityParameter, recordEntityParameter} from '@enre/container';
import {ENRELocation} from '@enre/location';
import {verbose} from '@enre/logging';
import {buildENREName} from '@enre/naming';
import {ENREContext} from '../context';
import traverseBindingPattern from './common/traverseBindingPattern';
import {ENREEntityCollectionAnyChildren} from '@enre/container/lib/entity/collections';

const onRecord = (name: string, location: ENRELocation, scope: ENREContext['scope']) => {
  const entity = recordEntityParameter(
    buildENREName(name),
    location,
    scope[scope.length - 1],
  );

  scope.last<ENREEntityCollectionAnyChildren>().children.push(entity);

  return entity;
};

const onLog = (entity: ENREEntityParameter) => {
  verbose('Record Entity Parameter (catch): ' + entity.name.printableName);
};

type PathType = NodePath<CatchClause>

export default {
  enter: (path: PathType, {scope}: ENREContext) => {
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

  exit: (path: PathType, {scope}: ENREContext) => {
    // scope.pop();
  }
};
