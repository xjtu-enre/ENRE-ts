/**
 * FunctionDeclaration
 *
 * Extractable entity:
 *   * Function
 */

import {ENREEntityCollectionScoping} from '../entities';
import {NodePath} from '@babel/traverse';
import {FunctionDeclaration} from '@babel/types';
import {recordEntityFunction} from '../entities/eFunction';
import {toENRELocation} from '../../utils/locationHelper';

export default (scope: Array<ENREEntityCollectionScoping>) => {
  return {
    enter: (path: NodePath<FunctionDeclaration>) => {
      const ent = recordEntityFunction(
        path.node.id?.name!,
        toENRELocation(path.node.id?.loc!),
        scope[scope.length - 1],
      );

      scope.push(ent);
    },

    exit: () => {
      scope.pop();
    }
  };
};
