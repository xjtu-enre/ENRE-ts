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
import {ENREEntityCollectionScoping} from '@enre/container';
import {ENREEntityInterface, recordEntityInterface} from '@enre/container/lib/entity/Interface';
import {toENRELocation} from '@enre/location';
import {verbose} from '@enre/logging';
import {buildENREName} from '@enre/naming';

export default (scope: Array<ENREEntityCollectionScoping>) => {
  return {
    enter: (path: NodePath<TSInterfaceDeclaration>) => {
      /**
       * Validate if there is already an interface entity with the same name first
       *
       * This is to support declaration merging
       */
      let entity: ENREEntityInterface | undefined;

      for (const sibling of scope.at(-1)!.children.get()) {
        if (sibling.type === 'interface' && sibling.name.printableName === path.node.id.name) {
          entity = sibling;
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

        scope.at(-1)!.children.add(entity);
      }

      scope.push(entity);
    },

    exit: () => {
      scope.pop();
    }
  };
};
