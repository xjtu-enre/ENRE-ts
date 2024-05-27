/**
 * AssignmentExpression
 *
 * Extracted entities:
 *   * N/A
 *
 * Extracted relations:
 *   * set
 *   * modify
 */

import {NodePath} from '@babel/traverse';
import {AssignmentExpression} from '@babel/types';
import {ENRERelationModify, ENRERelationSet, pseudoR} from '@enre-ts/data';
import {toENRELocation} from '@enre-ts/location';
import {ENREContext} from '../context';

type PathType = NodePath<AssignmentExpression>

export default (path: PathType, {scope}: ENREContext) => {
  if (path.node.left.type === 'Identifier') {
    // Since '=' assignment is handled in the expression-handler.ts, is this a duplication?
    if (path.node.operator === '=') {
      pseudoR.add<ENRERelationSet>({
        type: 'set',
        from: scope.last(),
        to: {role: 'value', identifier: path.node.left.name, at: scope.last()},
        location: toENRELocation(path.node.left.loc),
        isInit: false,
      });
    } else {
      pseudoR.add<ENRERelationModify>({
        type: 'modify',
        from: scope.last(),
        to: {role: 'value', identifier: path.node.left.name, at: scope.last()},
        location: toENRELocation(path.node.left.loc),
      });
    }
  }
};
