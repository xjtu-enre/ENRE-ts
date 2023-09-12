/**
 * TSEnumDeclaration
 *
 * Extracted entities:
 *   * Enum
 */

import {NodePath} from '@babel/traverse';
import {TSEnumDeclaration} from '@babel/types';
import {ENREEntityCollectionInFile, ENREEntityEnum, id, recordEntityEnum} from '@enre/data';
import {toENRELocation} from '@enre/location';
import {ENREContext} from '../context';
import ENREName from '@enre/naming';

type PathType = NodePath<TSEnumDeclaration>

export default {
  enter: (path: PathType, {scope}: ENREContext) => {
    /**
     * Validate if there is already an enum entity with the same name first.
     * This is to support declaration merging.
     */
    let entity: id<ENREEntityEnum> | undefined;

    for (const sibling of scope.last().children) {
      if (sibling.type === 'enum' && sibling.name.payload === path.node.id.name) {
        entity = sibling as id<ENREEntityEnum>;

        // entity!.declarations.push(toENRELocation(path.node.id.loc));
        break;
      }
    }

    if (!entity) {
      entity = recordEntityEnum(
        new ENREName('Norm', path.node.id.name),
        toENRELocation(path.node.id.loc),
        scope[scope.length - 1],
        {
          isConst: path.node.const as boolean,
        },
      );

      (scope.last().children as ENREEntityCollectionInFile[]).push(entity);
    }

    /**
     * No matter how this enum entity is created (either a new one or already existed one),
     * add it to the scope for enum member to be correctly chained.
     */
    scope.push(entity);
  },

  exit: (path: PathType, {scope}: ENREContext) => {
    scope.pop();
  }
};
