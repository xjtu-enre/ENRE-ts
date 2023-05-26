/**
 * TSTypeAliasDeclaration
 *
 * Extracted entities:
 *   * Type Alias
 */

import {NodePath} from '@babel/traverse';
import {TSTypeAliasDeclaration} from '@babel/types';
import {recordEntityTypeAlias} from '@enre/container';
import {toENRELocation} from '@enre/location';
import {verbose} from '@enre/logging';
import {buildENREName} from '@enre/naming';
import {ENREContext} from '../context';
import {ENREEntityCollectionAnyChildren} from '@enre/container/lib/entity/collections';

type PathType = NodePath<TSTypeAliasDeclaration>

export default {
  enter: (path: PathType, {scope}: ENREContext) => {
    const entity = recordEntityTypeAlias(
      buildENREName(path.node.id.name),
      toENRELocation(path.node.id.loc),
      scope.last(),
    );

    verbose('Record Entity Type Alias: ' + entity.name.printableName);

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
