/**
 * TSTypeAliasDeclaration
 *
 * Extracted entities:
 *   * Type Alias
 */

import {NodePath} from '@babel/traverse';
import {TSTypeAliasDeclaration} from '@babel/types';
import {ENREEntityCollectionAnyChildren, recordEntityTypeAlias} from '@enre-ts/data';
import {toENRELocation} from '@enre-ts/location';
import {ENREContext} from '../context';
import ENREName from '@enre-ts/naming';

type PathType = NodePath<TSTypeAliasDeclaration>

export default {
  enter: (path: PathType, {scope}: ENREContext) => {
    const entity = recordEntityTypeAlias(
      new ENREName('Norm', path.node.id.name),
      toENRELocation(path.node.id.loc),
      scope.last(),
    );

    scope.last<ENREEntityCollectionAnyChildren>().children.push(entity);
    /**
     * Type alias can open a scope for its type parameters.
     */
    scope.push(entity);
  },

  exit: (path: PathType, {scope}: ENREContext) => {
    scope.pop();
  }
};
