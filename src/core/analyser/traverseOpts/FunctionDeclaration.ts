/**
 * FunctionDeclaration|FunctionExpression
 *
 * Extractable entity:
 *   * Function
 *     - (Exclude) Arrow Function
 *   * Parameter
 */

import {ENREEntityCollectionScoping, ENRELocation} from '../entities';
import {NodePath} from '@babel/traverse';
import {FunctionDeclaration, FunctionExpression, SourceLocation} from '@babel/types';
import {ENREEntityFunction, recordEntityFunction} from '../entities/eFunction';
import {toENRELocation} from '../../utils/locationHelper';
import {verbose} from '../../utils/cliRender';
import {buildENREName, ENRENameAnonymous} from '../../utils/nameHelper';
import {ENREEntityParameter, recordEntityParameter} from '../entities/eParameter';
import handleBindingPatternRecursively from './common/handleBindingPatternRecursively';

const onRecord = (name: string, location: ENRELocation, scope: Array<ENREEntityCollectionScoping>) => {
  return recordEntityParameter(
    buildENREName(name),
    location,
    scope[scope.length - 1],
  );
};

const onLog = (entity: ENREEntityParameter) => {
  verbose('Record Entity Parameter: ' + entity.name.printableName);
};

export default (scope: Array<ENREEntityCollectionScoping>) => {
  return {
    enter: (path: NodePath<FunctionDeclaration | FunctionExpression>) => {
      let entity: ENREEntityFunction;

      if (path.node.id) {
        entity = recordEntityFunction(
          buildENREName(path.node.id.name),
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
          buildENREName<ENRENameAnonymous>({as: 'Function'}),
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
      verbose('Record Entity Function: ' + entity.name.printableName);

      scope.push(entity);

      for (const param of path.node.params) {
        handleBindingPatternRecursively<ENREEntityParameter>(
          param,
          scope,
          onRecord,
          onLog,
        );
      }
    },

    exit: () => {
      scope.pop();
    }
  };
};
