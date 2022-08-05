/**
 * TSEnumDeclaration
 *
 * Extracted entities:
 *   * Enum
 */

import {NodePath} from '@babel/traverse';
import {SourceLocation, TSEnumDeclaration} from '@babel/types';
import {ENREEntityCollectionInFile, ENREEntityEnum, recordEntityEnum} from '@enre/container';
import {toENRELocation} from '@enre/location';
import {verbose} from '@enre/logging';
import {buildENREName} from '@enre/naming';
import {ENREContext} from '../context';

export default ({scope}: ENREContext) => {
  return {
    enter: (path: NodePath<TSEnumDeclaration>) => {
      /**
       * Validate if there is already an enum entity with the same name first.
       * This is to support declaration merging.
       */
      let entity: ENREEntityEnum | undefined;

      for (const sibling of scope.last().children) {
        if (sibling.type === 'enum' && sibling.name.payload === path.node.id.name) {
          entity = sibling;

          entity.declarations.push(toENRELocation(path.node.id.loc as SourceLocation));
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

        (scope.last().children as ENREEntityCollectionInFile[]).push(entity);
      }

      /**
       * No matter how this enum entity is created (either a new one or already existed one),
       * add it to the scope for enum member to be correctly chained.
       */
      scope.push(entity);
    },

    exit: () => {
      scope.pop();
    }
  };
};
