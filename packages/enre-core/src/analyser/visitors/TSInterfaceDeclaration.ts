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
import {TSInterfaceDeclaration} from '@babel/types';
import {ENREEntityCollectionInFile, ENREEntityInterface, pseudoR, recordEntityInterface} from '@enre/container';
import {toENRELocation} from '@enre/location';
import {verbose} from '@enre/logging';
import {buildENREName} from '@enre/naming';
import {ENREContext} from '../context';
import {lastOf} from '../context/scope';

export default ({scope}: ENREContext) => {
  return {
    enter: (path: NodePath<TSInterfaceDeclaration>) => {
      /**
       * Validate if there is already an interface entity with the same name first.
       * This is to support declaration merging.
       */
      let entity: ENREEntityInterface | undefined;

      for (const sibling of lastOf(scope).children) {
        if (sibling.type === 'interface' && sibling.name.printableName === path.node.id.name) {
          entity = sibling;

          entity.declarations.push(toENRELocation(path.node.id.loc));
          break;
        }
      }

      if (!entity) {
        entity = recordEntityInterface(
          buildENREName(path.node.id.name),
          toENRELocation(path.node.id.loc),
          scope[scope.length - 1],
        );
        verbose('Record Entity Interface: ' + entity.name.printableName);

        (lastOf(scope).children as ENREEntityCollectionInFile[]).push(entity);
      }

      for (const ex of path.node.extends || []) {
        if (ex.expression.type === 'Identifier') {
          pseudoR.add({
            type: 'extend',
            from: entity,
            to: {role: 'type', identifier: ex.expression.name},
            location: toENRELocation(ex.expression.loc),
            at: lastOf(scope),
          });
        }
      }

      scope.push(entity);
    },

    exit: () => {
      scope.pop();
    }
  };
};
