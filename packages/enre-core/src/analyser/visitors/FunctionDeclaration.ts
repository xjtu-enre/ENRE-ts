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
  ENREEntityCollectionScoping,
  ENREEntityFunction,
  ENREEntityParameter,
  recordEntityFunction,
  recordEntityParameter
} from '@enre/container';
import {ENRELocation, toENRELocation} from '@enre/location';
import {verbose} from '@enre/logging';
import {buildENREName, ENRENameAnonymous} from '@enre/naming';
import handleBindingPatternRecursively from './common/handleBindingPatternRecursively';

const onRecord = (name: string, location: ENRELocation, scope: Array<ENREEntityCollectionScoping>) => {
  const entity = recordEntityParameter(
    buildENREName(name),
    location,
    scope[scope.length - 1],
  );

  scope.at(-1)!.children.add(entity);

  return entity;
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

      scope.at(-1)!.children.add(entity);
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
    },
  };
};
