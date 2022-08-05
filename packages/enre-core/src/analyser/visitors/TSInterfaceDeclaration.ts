/**
 * TSInterfaceDeclaration
 *
 * Extracted entities:
 *   * Interface
 *
 * Extracted relations:
 *   * Extend
 */

import {NodePath} from '@babel/traverse';
import {SourceLocation, TSInterfaceDeclaration} from '@babel/types';
import {ENREEntityCollectionInFile, ENREEntityInterface, recordEntityInterface} from '@enre/container';
import {toENRELocation} from '@enre/location';
import {verbose} from '@enre/logging';
import {buildENREName} from '@enre/naming';
import {ENREContext} from '../context';

export default ({scope}: ENREContext) => {
  return {
    enter: (path: NodePath<TSInterfaceDeclaration>) => {
      /**
       * Validate if there is already an interface entity with the same name first.
       * This is to support declaration merging.
       */
      let entity: ENREEntityInterface | undefined;

      for (const sibling of scope.last().children) {
        if (sibling.type === 'interface' && sibling.name.printableName === path.node.id.name) {
          entity = sibling;

          entity.declarations.push(toENRELocation(path.node.id.loc as SourceLocation));
          break;
        }
      }

      if (!entity) {
        entity = recordEntityInterface(
          buildENREName(path.node.id.name),
          toENRELocation(path.node.id.loc as SourceLocation),
          scope[scope.length - 1],
        );
        verbose('Record Entity Interface: ' + entity.name.printableName);

        (scope.last().children as ENREEntityCollectionInFile[]).push(entity);
      }

      scope.push(entity);
    },

    exit: () => {
      scope.pop();
    }
  };
};
