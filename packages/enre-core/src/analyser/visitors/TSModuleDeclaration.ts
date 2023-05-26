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
import {ENREEntityCollectionInFile, ENREEntityNamespace, recordEntityNamespace} from '@enre/container';
import {toENRELocation} from '@enre/location';
import {verbose} from '@enre/logging';
import {buildENREName, ENRENameModified} from '@enre/naming';
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
      if (sibling.type === 'namespace' && sibling.name.codeName === (path.node.id.type === 'StringLiteral' ? path.node.id.value : path.node.id.name)) {
        entity = sibling;

        entity!.declarations.push(toENRELocation(path.node.id.loc));
        break;
      }
    }

    if (!entity) {
      if (path.node.id.type === 'StringLiteral') {
        entity = recordEntityNamespace(
          buildENREName<ENRENameModified>({as: 'StringLiteral', raw: path.node.id.value}),
          toENRELocation(path.node.id.loc),
          scope[scope.length - 1],
        );
      } else {
        entity = recordEntityNamespace(
          buildENREName(path.node.id.name),
          toENRELocation(path.node.id.loc),
          scope[scope.length - 1],
        );
      }
      verbose('Record Entity Namespace: ' + entity.name.printableName);

      (scope.last().children as ENREEntityCollectionInFile[]).push(entity);
    }

    scope.push(entity);
  },

  exit: (path: PathType, {scope}: ENREContext) => {
    scope.pop();
  }
};
