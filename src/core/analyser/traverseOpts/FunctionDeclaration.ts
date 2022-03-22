/**
 * FunctionDeclaration|FunctionExpression
 *
 * Extractable entity:
 *   * Function
 *     - (Exclude) Arrow Function
 */

import {ENREEntityCollectionScoping} from '../entities';
import {NodePath} from '@babel/traverse';
import {FunctionDeclaration, FunctionExpression, SourceLocation} from '@babel/types';
import {ENREEntityFunction, recordEntityFunction} from '../entities/eFunction';
import {toENRELocation} from '../../utils/locationHelper';
import {verbose} from '../../utils/cliRender';
import {buildENRECodeName, ENRENameBuildOption} from '../../utils/nameHelper';

export default (scope: Array<ENREEntityCollectionScoping>) => {
  return {
    enter: (path: NodePath<FunctionDeclaration | FunctionExpression>) => {
      let entity: ENREEntityFunction;

      if (path.node.id) {
        entity = recordEntityFunction(
          buildENRECodeName(ENRENameBuildOption.value, path.node.id.name),
          /**
           * If it's a named function, use identifier's location as entity location.
           */
          toENRELocation(path.node.id.loc as SourceLocation),
          scope[scope.length - 1],
          false,
          path.node.async,
          path.node.generator,
        );
      } else {
        entity = recordEntityFunction(
          buildENRECodeName(ENRENameBuildOption.anonymous, {type: 'function'}),
          /**
           * If it's an unnamed function,
           * use the start position of this function declaration block
           * as the start position of this entity, and set length to 0.
           *
           * This will also count in `async`.
           */
          toENRELocation(path.node.loc as SourceLocation),
          scope[scope.length - 1],
          false,
          path.node.async,
          path.node.generator,
        );
      }
      verbose('FunctionDeclaration: ' + entity.name.printableName);

      scope.push(entity);
    },

    exit: () => {
      scope.pop();
    }
  };
};
