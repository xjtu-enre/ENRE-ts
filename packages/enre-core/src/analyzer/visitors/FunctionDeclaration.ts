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
  ENREEntityParameter,
  recordEntityFunction,
  recordEntityParameter,
} from '@enre/data';
import {ENRELocation, toENRELocation} from '@enre/location';
import ENREName from '@enre/naming';
import {ENREContext} from '../context';
import traverseBindingPattern, {BindingPath} from './common/traverseBindingPattern';
import {createJSObjRepr} from './common/resolveJSObj';

const onRecord = (name: string, location: ENRELocation, scope: ENREContext['scope'], path: BindingPath) => {
  const entity = recordEntityParameter(
    new ENREName('Norm', name),
    location,
    scope.last<ENREEntityFunction>(),
    {path},
  );

  scope.last<ENREEntityFunction>().children.push(entity);

  return entity;
};

type PathType = NodePath<FunctionDeclaration | FunctionExpression>

export default {
  enter: (path: PathType, {scope}: ENREContext) => {
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

    entity.pointsTo.push(createJSObjRepr('obj'));

    scope.last<ENREEntityCollectionAnyChildren>().children.push(entity);
    scope.push(entity);

    // TODO: Extract parameter extraction to a reuseable component
    for (const [index, param] of Object.entries(path.node.params)) {
      if (param.type === 'Identifier' && param.name === 'this') {
        continue;
      } else {
        let prefix: BindingPath = [{type: 'array'}, {type: 'key', key: index}];
        if (param.type === 'RestElement') {
          prefix = [{type: 'array'}, {type: 'rest', start: index}];
        }

        traverseBindingPattern<ENREEntityParameter>(
          param,
          scope,
          prefix,
          onRecord,
        );
      }
    }
  },

  exit: (path: PathType, {scope}: ENREContext) => {
    scope.pop();
  },
};
