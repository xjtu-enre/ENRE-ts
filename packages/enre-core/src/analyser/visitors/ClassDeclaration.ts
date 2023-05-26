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
import {ClassDeclaration, ClassExpression} from '@babel/types';
import {ENREEntityClass, ENRERelationExtend, ENRERelationImplement, pseudoR, recordEntityClass} from '@enre/container';
import {toENRELocation} from '@enre/location';
import {verbose} from '@enre/logging';
import {buildENREName, ENRENameAnonymous} from '@enre/naming';
import {ENREContext} from '../context';
import {ENREEntityCollectionAnyChildren} from '@enre/container/lib/entity/collections';

type PathType = NodePath<ClassDeclaration | ClassExpression>

export default {
  enter: (path: PathType, {scope}: ENREContext) => {
    let entity: ENREEntityClass;

    if (path.node.id) {
      entity = recordEntityClass(
        buildENREName(path.node.id.name),
        /**
         * If it's a named class, use identifier's location as entity location.
         */
        toENRELocation(path.node.id.loc),
        scope.last(),
        {
          isAbstract: 'abstract' in path.node ? path.node.abstract ?? false : false,
        },
      );
    } else {
      entity = recordEntityClass(
        buildENREName<ENRENameAnonymous>({as: 'Class'}),
        /**
         * If it's an unnamed class,
         * use the start position of this class declaration block
         * as the start position of this entity, and set length to 0.
         */
        toENRELocation(path.node.loc),
        scope.last(),
        {
          isAbstract: 'abstract' in path.node ? path.node.abstract ?? false : false,
        },
      );
    }
    verbose('Record Entity Class: ' + entity.name.printableName);

    if (path.node.superClass) {
      if (path.node.superClass.type === 'Identifier') {
        pseudoR.add<ENRERelationExtend>({
          type: 'extend',
          from: entity,
          to: {role: 'value', identifier: path.node.superClass.name, at: scope.last()},
          location: toENRELocation(path.node.superClass.loc),
        });
      }
    }

    for (const im of path.node.implements || []) {
      if (im.type === 'TSExpressionWithTypeArguments') {
        if (im.expression.type === 'Identifier') {
          pseudoR.add<ENRERelationImplement>({
            type: 'implement',
            from: entity,
            to: {role: 'type', identifier: im.expression.name, at: scope.last()},
            location: toENRELocation(im.expression.loc),
          });
        }
      }
    }

    scope.last<ENREEntityCollectionAnyChildren>().children.push(entity);
    scope.push(entity);
  },

  exit: (path: PathType, {scope}: ENREContext) => {
    scope.pop();
  }
};
