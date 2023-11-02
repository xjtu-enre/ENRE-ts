/**
 * VariableDeclaration
 *
 * Extracted entities:
 *   * Variable
 *
 * Extracted relations:
 *   * Set @init=true
 */

import {NodePath} from '@babel/traverse';
import {VariableDeclaration} from '@babel/types';
import {
  ENREEntityCollectionAnyChildren,
  ENREEntityVariable,
  postponedTask,
  recordEntityVariable,
  recordRelationSet,
} from '@enre/data';
import {ENRELocation} from '@enre/location';
import {ENREContext} from '../context';
import traverseBindingPattern from './common/traverseBindingPattern';
import ENREName from '@enre/naming';
import {variableKind} from '@enre/shared';
import resolveJSObj from './common/resolveJSObj';

const buildOnRecord = (kind: variableKind, hasInit: boolean) => {
  return (name: string, location: ENRELocation, scope: ENREContext['scope']) => {
    const entity = recordEntityVariable(
      new ENREName('Norm', name),
      location,
      scope.last(),
      {kind},
    );

    scope.last<ENREEntityCollectionAnyChildren>().children.push(entity);

    if (hasInit) {
      // Record relation `set`
      recordRelationSet(
        scope.last(),
        entity,
        location,
        {isInit: true},
      );
    }

    return entity;
  };
};

type PathType = NodePath<VariableDeclaration>

export default {
  enter: (path: PathType, {scope, modifiers}: ENREContext) => {
    const kind = path.node.kind;
    for (const declarator of path.node.declarations) {
      const objRepr = resolveJSObj(declarator.init);

      const returned = traverseBindingPattern<ENREEntityVariable>(
        declarator.id,
        scope,
        undefined,
        buildOnRecord(kind as variableKind, !!objRepr),
      );

      if (returned && objRepr) {
        postponedTask.add({
          type: 'ascend',
          payload: [{
            operation: 'assign',
            operand0: returned,
            operand1: objRepr,
          }],
          scope: scope.last(),
        });
      }

      /**
       * Setup to extract properties from object literals,
       * which expects id to be an identifier.
       *
       * (BindingPattern will be supported by hidden dependency extraction.)
       */
      // if (declarator.id.type === 'Identifier') {
      //   if (declarator.init?.type === 'ObjectExpression') {
      //     if (returned) {
      //       scope.push(returned);
      //
      //       const key = `${path.node.loc!.start.line}:${path.node.loc!.start.column}`;
      //       modifiers.set(key, ({
      //         type: ModifierType.acceptProperty,
      //         proposer: returned,
      //       }));
      //     }
      //   }
      // }
    }
  },

  exit: (path: PathType, {modifiers}: ENREContext) => {
    // if (path.node.declarator.id.type === 'Identifier') {
    //   if (declarator.init?.type === 'ObjectExpression') {
    //   }
    // }
    // const key = `${path.node.loc!.start.line}:${path.node.loc!.start.column}`;
    // modifiers.delete(key);
  }
};
