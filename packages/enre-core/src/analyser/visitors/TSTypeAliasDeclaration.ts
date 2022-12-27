/**
 * TSTypeAliasDeclaration
 *
 * Extracted entities:
 *   * Type Alias
 */

import {NodePath} from '@babel/traverse';
import {TSTypeAliasDeclaration} from '@babel/types';
import {ENREEntityCollectionInFile, recordEntityTypeAlias} from '@enre/container';
import {toENRELocation} from '@enre/location';
import {verbose} from '@enre/logging';
import {buildENREName} from '@enre/naming';
import {ENREContext} from '../context';
import {lastOf} from '../context/scope';

export default ({scope}: ENREContext) => {
  return {
    enter: (path: NodePath<TSTypeAliasDeclaration>) => {
      const entity = recordEntityTypeAlias(
        buildENREName(path.node.id.name),
        toENRELocation(path.node.id.loc),
        lastOf(scope),
      );

      verbose('Record Entity Type Alias: ' + entity.name.printableName);

      (lastOf(scope).children as ENREEntityCollectionInFile[]).push(entity);
      /**
       * Type alias can open a scope for its type parameters.
       */
      scope.push(entity);
    },

    exit: () => {
      scope.pop();
    }
  };
};
