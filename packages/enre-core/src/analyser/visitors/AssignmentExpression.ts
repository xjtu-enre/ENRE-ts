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
import {pseudoR} from '@enre/container';
import {toENRELocation} from '@enre/location';
import {ENREContext} from '../context';
import {lastOf} from '../context/scope';

export default ({scope}: ENREContext) => {
  return (path: NodePath<AssignmentExpression>) => {
    if (path.node.left.type === 'Identifier') {
      if (path.node.operator === '=') {
        pseudoR.add({
          type: 'set',
          from: lastOf(scope),
          to: {role: 'value', identifier: path.node.left.name},
          location: toENRELocation(path.node.left.loc),
          at: lastOf(scope),
        });
      } else {
        pseudoR.add({
          type: 'modify',
          from: lastOf(scope),
          to: {role: 'value', identifier: path.node.left.name},
          location: toENRELocation(path.node.left.loc),
          at: lastOf(scope),
        });
      }
    }
  };
};
