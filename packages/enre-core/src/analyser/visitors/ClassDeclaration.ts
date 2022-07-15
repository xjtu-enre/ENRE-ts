/**
 * ClassDeclaration|ClassExpression
 *
 * Extractable entity:
 *   * Class
 */

import {NodePath} from '@babel/traverse';
import {ClassDeclaration, ClassExpression, SourceLocation} from '@babel/types';
import {ENREEntityClass, ENREEntityCollectionScoping, recordEntityClass} from '@enre/container';
import {toENRELocation} from '@enre/location';
import {verbose} from '@enre/logging';
import {buildENREName, ENRENameAnonymous} from '@enre/naming';

export default (scope: Array<ENREEntityCollectionScoping>) => {
  return {
    enter: (path: NodePath<ClassDeclaration | ClassExpression>) => {
      let entity: ENREEntityClass;

      if (path.node.id) {
        entity = recordEntityClass(
          buildENREName(path.node.id.name),
          /**
           * If it's a named class, use identifier's location as entity location.
           */
          toENRELocation(path.node.id.loc as SourceLocation),
          scope[scope.length - 1],
        );
      } else {
        entity = recordEntityClass(
          buildENREName<ENRENameAnonymous>({as: 'Class'}),
          /**
           * If it's an unnamed class,
           * use the start position of this class declaration block
           * as the start position of this entity, and set length to 0.
           */
          toENRELocation(path.node.loc as SourceLocation),
          scope[scope.length - 1],
        );
      }
      verbose('Record Entity Class: ' + entity.name.printableName);

      scope.at(-1)!.children.add(entity);
      scope.push(entity);
    },

    exit: () => {
      scope.pop();
    }
  };
};
