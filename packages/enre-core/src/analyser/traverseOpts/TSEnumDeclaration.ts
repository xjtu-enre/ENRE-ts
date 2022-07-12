/**
 * TSEnumDeclaration
 *
 * Extractable entity:
 *   * Enum
 */

import {NodePath} from '@babel/traverse';
import {SourceLocation, TSEnumDeclaration} from '@babel/types';
import {toENRELocation} from '@enre/location';
import {verbose} from '@enre/logging';
import {buildENREName} from '@enre/naming';
import {ENREEntityCollectionScoping} from '../entities';
import {ENREEntityEnum, recordEntityEnum} from '../entities/eEnum';

export default (scope: Array<ENREEntityCollectionScoping>) => {
  return {
    enter: (path: NodePath<TSEnumDeclaration>) => {
      /**
       * Validate if there is already an enum entity with the same name first
       *
       * This is to support declaration merging
       */
      let entity: ENREEntityEnum | undefined;

      for (const sibling of scope.at(-1)!.children.get()) {
        if (sibling.type === 'enum' && sibling.name.printableName === path.node.id.name) {
          entity = sibling;
          break;
        }
      }

      if (!entity) {
        entity = recordEntityEnum(
          buildENREName(path.node.id.name),
          toENRELocation(path.node.id.loc as SourceLocation),
          scope[scope.length - 1],
          path.node.const as boolean,
        );
        verbose('Record Entity Enum: ' + entity.name.printableName);

        scope.at(-1)!.children.add(entity);
      }

      /**
       * No matter how this enum entity is created (either a new one or already existed one),
       * add it to the scope for enum member to be correctly chained
       */
      scope.push(entity);
    },

    exit: () => {
      scope.pop();
    }
  };
};
