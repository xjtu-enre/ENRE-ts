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
import {AssignmentExpression, SourceLocation} from '@babel/types';
import {pseudoR} from '@enre/container';
import {toENRELocation} from '@enre/location';
import {ENREContext} from '../context';

export default ({scope}: ENREContext) => {
  return (path: NodePath<AssignmentExpression>) => {
    if (path.node.left.type === 'Identifier') {
      if (path.node.operator === '=') {
        pseudoR.add({
          type: 'set',
          from: scope.last(),
          to: {role: 'value', identifier: path.node.left.name},
          location: toENRELocation(path.node.left.loc as SourceLocation),
          at: scope.last(),
        });
      } else {
        pseudoR.add({
          type: 'modify',
          from: scope.last(),
          to: {role: 'value', identifier: path.node.left.name},
          location: toENRELocation(path.node.left.loc as SourceLocation),
          at: scope.last(),
        });
      }
    }
  };
};
