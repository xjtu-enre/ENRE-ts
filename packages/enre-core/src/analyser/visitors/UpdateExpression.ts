/**
 * UpdateExpression
 *
 * Extracted entities:
 *   * N/A
 *
 * Extracted relations:
 *   * modify
 */

import {NodePath} from '@babel/traverse';
import {SourceLocation, UpdateExpression} from '@babel/types';
import {pseudoR} from '@enre/container';
import {toENRELocation} from '@enre/location';
import {ENREContext} from '../context';

export default ({scope}: ENREContext) => {
  return (path: NodePath<UpdateExpression>) => {
    if (path.node.argument.type === 'Identifier') {
      pseudoR.add({
        type: 'modify',
        from: scope.last(),
        to: {role: 'value', identifier: path.node.argument.name},
        location: toENRELocation(path.node.argument.loc as SourceLocation),
        at: scope.last(),
      });
    }
  };
};
