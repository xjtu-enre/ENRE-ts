/**
 * CatchClause
 *
 * Extracted entities:
 *   * Parameter
 */

import {NodePath} from '@babel/traverse';
import {CatchClause} from '@babel/types';
import {ENREEntityCollectionAnyChildren, ENREEntityParameter, id, recordEntityParameter} from '@enre/data';
import {ENRELocation} from '@enre/location';
import ENREName from '@enre/naming';
import {ENREContext} from '../context';
import traverseBindingPattern from './common/traverseBindingPattern';

const onRecord = (name: string, location: ENRELocation, scope: ENREContext['scope']) => {
  const entity = recordEntityParameter(
    new ENREName('Norm', name),
    location,
    scope[scope.length - 1],
    {path: ''}
  );

  scope.last<ENREEntityCollectionAnyChildren>().children.push(entity);

  return entity;
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
      );
    }
  },

  exit: (path: PathType, {scope}: ENREContext) => {
    // scope.pop();
  }
};
