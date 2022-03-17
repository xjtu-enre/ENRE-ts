/**
 * FunctionDeclaration
 *
 * Extractable entity:
 *   * Function
 *     - (Exclude) Arrow Function
 */

import {ENREEntityCollectionScoping} from '../entities';
import {NodePath} from '@babel/traverse';
import {FunctionDeclaration, SourceLocation} from '@babel/types';
import {ENREEntityFunction, recordEntityFunction} from '../entities/eFunction';
import {toENRELocation, ToENRELocationPolicy} from '../../utils/locationHelper';

export default (scope: Array<ENREEntityCollectionScoping>) => {
  return {
    enter: (path: NodePath<FunctionDeclaration>) => {
      let ent: ENREEntityFunction;

      if (path.node.id) {
        ent = recordEntityFunction(
          path.node.id.name,
          toENRELocation(path.node.loc as SourceLocation, ToENRELocationPolicy.NoEnd),
          scope[scope.length - 1],
          false,
          path.node.async,
          path.node.generator,
        );
      } else {
        ent = recordEntityFunction(
          '<anonymous type="function"/>',
          toENRELocation(path.node.loc as SourceLocation, ToENRELocationPolicy.NoEnd),
          scope[scope.length - 1],
          false,
          path.node.async,
          path.node.generator,
        );
      }

      scope.push(ent);
    },

    exit: () => {
      scope.pop();
    }
  };
};
