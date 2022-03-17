/**
 * ArrowFunctionDeclaration
 *
 * Extractable entity:
 *   * Function
 *     + (Only) Arrow Function
 */

import {ENREEntityCollectionScoping} from '../entities';
import {NodePath} from '@babel/traverse';
import {FunctionDeclaration, SourceLocation} from '@babel/types';
import {recordEntityFunction} from '../entities/eFunction';
import {toENRELocation, ToENRELocationPolicy} from '../../utils/locationHelper';

export default (scope: Array<ENREEntityCollectionScoping>) => {
  return {
    enter: (path: NodePath<FunctionDeclaration>) => {
      const ent = recordEntityFunction(
        '<anonymous type="arrowFunction"/>',
        toENRELocation(path.node.loc as SourceLocation, ToENRELocationPolicy.NoEnd),
        scope[scope.length - 1],
        true,
        path.node.async,
        path.node.generator,
      );

      scope.push(ent);
    },

    exit: () => {
      scope.pop();
    }
  };
};
