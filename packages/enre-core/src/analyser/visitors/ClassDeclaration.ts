/**
 * ClassDeclaration|ClassExpression
 *
 * Extracted entities:
 *   * Class
 *
 * Extracted relations:
 *   * Extend
 *   * Implement
 */

import {NodePath} from '@babel/traverse';
import {ClassDeclaration, ClassExpression, SourceLocation} from '@babel/types';
import {ENREEntityClass, ENREEntityCollectionInFile, recordEntityClass} from '@enre/container';
import {toENRELocation} from '@enre/location';
import {verbose} from '@enre/logging';
import {buildENREName, ENRENameAnonymous} from '@enre/naming';
import {ENREContext} from '../context';

export default ({scope}: ENREContext) => {
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
          scope.last(),
          'abstract' in path.node ? path.node.abstract ?? false : false,
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
          scope.last(),
          'abstract' in path.node ? path.node.abstract ?? false : false,
        );
      }
      verbose('Record Entity Class: ' + entity.name.printableName);

      (scope.last().children as ENREEntityCollectionInFile[]).push(entity);
      scope.push(entity);
    },

    exit: () => {
      scope.pop();
    }
  };
};
