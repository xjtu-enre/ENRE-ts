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
import {SourceLocation, TSModuleDeclaration} from '@babel/types';
import {ENREEntityCollectionInFile, ENREEntityNamespace, recordEntityNamespace} from '@enre/container';
import {toENRELocation} from '@enre/location';
import {verbose, warn} from '@enre/logging';
import {buildENREName} from '@enre/naming';
import {ENREContext} from '../context';

export default ({scope}: ENREContext) => {
  return {
    enter: (path: NodePath<TSModuleDeclaration>) => {
      if (path.node.id.type === 'StringLiteral') {
        warn('Unhandled situation that StringLiteral as TSNamespace\'s name, please report this with corresponding code.');
        return;
      }

      /**
       * Validate if there is already a namespace entity with the same name first.
       * This is to support declaration merging.
       */
      let entity: ENREEntityNamespace | undefined;

      for (const sibling of scope.last().children) {
        if (sibling.type === 'namespace' && sibling.name.printableName === path.node.id.name) {
          entity = sibling;

          entity.declarations.push(toENRELocation(path.node.id.loc as SourceLocation));
          break;
        }
      }

      if (!entity) {
        entity = recordEntityNamespace(
          buildENREName(path.node.id.name),
          toENRELocation(path.node.id.loc as SourceLocation),
          scope[scope.length - 1],
        );
        verbose('Record Entity Namespace: ' + entity.name.printableName);

        (scope.last().children as ENREEntityCollectionInFile[]).push(entity);
      }

      scope.push(entity);
    },

    exit: () => {
      scope.pop();
    }
  };
};
