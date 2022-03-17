/**
 * ArrowFunctionDeclaration
 *
 * Extractable entity:
 *   * Function
 *     + (Only) Arrow Function
 */

import {ENREEntityCollectionScoping} from '../entities';
import {NodePath} from '@babel/traverse';
import {ArrowFunctionExpression, SourceLocation} from '@babel/types';
import {recordEntityFunction} from '../entities/eFunction';
import {toENRELocation, ToENRELocationPolicy} from '../../utils/locationHelper';
import {verbose} from '../../utils/cliRender';

export default (scope: Array<ENREEntityCollectionScoping>) => {
  return {
    enter: (path: NodePath<ArrowFunctionExpression>) => {
      const entity = recordEntityFunction(
        '<anonymous type="arrowFunction"/>',
        toENRELocation(path.node.loc as SourceLocation, ToENRELocationPolicy.NoEnd),
        scope[scope.length - 1],
        true,
        path.node.async,
        path.node.generator,
      );
      verbose('FunctionDeclaration(Arrow): ' + entity.name);

      scope.push(entity);
    },

    exit: () => {
      scope.pop();
    }
  };
};
