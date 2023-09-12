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
import {
  ENREEntityCollectionInFile,
  ENREEntityInterface,
  ENRERelationExtend,
  id,
  pseudoR,
  recordEntityInterface
} from '@enre/data';
import {toENRELocation} from '@enre/location';
import {ENREContext} from '../context';
import ENREName from '@enre/naming';

type PathType = NodePath<TSInterfaceDeclaration>

export default {
  enter: (path: PathType, {scope}: ENREContext) => {
    /**
     * Validate if there is already an interface entity with the same name first.
     * This is to support declaration merging.
     */
    let entity: id<ENREEntityInterface> | undefined;

    for (const sibling of scope.last().children) {
      if (sibling.type === 'interface' && sibling.name.string === path.node.id.name) {
        entity = sibling as id<ENREEntityInterface>;

        // entity!.declarations.push(toENRELocation(path.node.id.loc));
        break;
      }
    }

    if (!entity) {
      entity = recordEntityInterface(
        new ENREName('Norm', path.node.id.name),
        toENRELocation(path.node.id.loc),
        scope[scope.length - 1],
      );

      (scope.last().children as ENREEntityCollectionInFile[]).push(entity);
    }

    for (const ex of path.node.extends || []) {
      if (ex.expression.type === 'Identifier') {
        pseudoR.add<ENRERelationExtend>({
          type: 'extend',
          from: entity,
          to: {role: 'type', identifier: ex.expression.name, at: scope.last()},
          location: toENRELocation(ex.expression.loc),
        });
      }
    }

    scope.push(entity);
  },

  exit: (path: PathType, {scope}: ENREContext) => {
    scope.pop();
  }
};
