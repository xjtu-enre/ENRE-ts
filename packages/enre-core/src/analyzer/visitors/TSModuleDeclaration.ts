/**
 * TSModuleDeclaration
 *
 * Extracted entities:
 *   * Namespace
 *
 * Extracted relations:
 *   N/A
 */

import {NodePath} from '@babel/traverse';
import {TSModuleDeclaration} from '@babel/types';
import {ENREEntityCollectionInFile, ENREEntityNamespace, recordEntityNamespace} from '@enre/data';
import {toENRELocation} from '@enre/location';
import ENREName from '@enre/naming';
import {ENREContext} from '../context';

type PathType = NodePath<TSModuleDeclaration>

export default {
  enter: (path: PathType, {scope}: ENREContext) => {
    /**
     * Validate if there is already a namespace entity with the same name first.
     * This is to support declaration merging.
     */
    let entity: ENREEntityNamespace | undefined;

    for (const sibling of scope.last().children) {
      // TODO: Class, function, and enum can also be merged with a namespace, when this happens, the invoke order is important.
      // https://www.typescriptlang.org/docs/handbook/declaration-merging.html#merging-namespaces-with-classes-functions-and-enums
      if (sibling.type === 'namespace' && sibling.name.codeName === (path.node.id.type === 'StringLiteral' ? path.node.id.value : path.node.id.name)) {
        entity = sibling as ENREEntityNamespace;

        // entity!.declarations.push(toENRELocation(path.node.id.loc));
        break;
      }
    }

    if (!entity) {
      if (path.node.id.type === 'StringLiteral') {
        entity = recordEntityNamespace(
          new ENREName<'Str'>('Str', path.node.id.value),
          toENRELocation(path.node.id.loc),
          scope[scope.length - 1],
        );
      } else {
        entity = recordEntityNamespace(
          new ENREName('Norm', path.node.id.name),
          toENRELocation(path.node.id.loc),
          scope[scope.length - 1],
        );
      }

      (scope.last().children as ENREEntityCollectionInFile[]).push(entity);
    }

    scope.push(entity);
  },

  exit: (path: PathType, {scope}: ENREContext) => {
    scope.pop();
  }
};
