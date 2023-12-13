/**
 * FunctionDeclaration|FunctionExpression
 *
 * Extracted entities:
 *   * Function
 *     - (Exclude) Arrow Function
 *   * Parameter
 */

import {NodePath} from '@babel/traverse';
import {FunctionDeclaration, FunctionExpression, SourceLocation} from '@babel/types';
import {
  ENREEntityCollectionAnyChildren,
  ENREEntityFunction,
  recordEntityFunction,
} from '@enre-ts/data';
import {toENRELocation} from '@enre-ts/location';
import ENREName from '@enre-ts/naming';
import {ENREContext} from '../context';
import {createJSObjRepr} from './common/literal-handler';
import parameterHandler from './common/parameter-handler';

type PathType = NodePath<FunctionDeclaration | FunctionExpression>

export default {
  enter: (path: PathType, {file: {logs}, scope}: ENREContext) => {
    let entity: ENREEntityFunction;

    if (path.node.id) {
      entity = recordEntityFunction(
        new ENREName('Norm', path.node.id.name),
        /**
         * If it's a named function, use identifier's location as entity location.
         */
        toENRELocation(path.node.id.loc),
        scope.last(),
        {
          isArrowFunction: false,
          isAsync: path.node.async,
          isGenerator: path.node.generator,
        },
      );
    } else {
      entity = recordEntityFunction(
        new ENREName<'Anon'>('Anon', 'Function'),
        /**
         * If it's an unnamed function,
         * use the start position of this function declaration block
         * as the start position of this entity, and set length to 0.
         *
         * This will also count in `async`.
         */
        toENRELocation(path.node.loc as SourceLocation),
        scope.last(),
        {
          isArrowFunction: false,
          isAsync: path.node.async,
          isGenerator: path.node.generator,
        },
      );
    }

    const objRepr = createJSObjRepr('obj');
    objRepr.callable.push({entity, returns: []});
    entity.pointsTo.push(objRepr);

    scope.last<ENREEntityCollectionAnyChildren>().children.push(entity);
    scope.push(entity);

    parameterHandler(path.node, scope, logs);
  },

  exit: (path: PathType, {scope}: ENREContext) => {
    scope.pop();
  },
};
