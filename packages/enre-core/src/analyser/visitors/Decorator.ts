/**
 * Decorator
 *
 * Extracted entities:
 *   * N/A
 *
 * Extracted relations:
 *   * decorate
 */

import {NodePath} from '@babel/traverse';
import {Decorator} from '@babel/types';
import {ENREContext} from '../context';
import {eGraph, pseudoR} from '@enre/container';
import {toENRELocation} from '@enre/location';
import {ENRERelationDecorate} from '@enre/container/lib/relation/variant/decorate';

type PathType = NodePath<Decorator>

export default (path: PathType, {scope}: ENREContext) => {
  const expressionType = path.node.expression.type;

  if (expressionType === 'Identifier') {
    pseudoR.add<ENRERelationDecorate>({
      from: {role: 'value', identifier: path.node.expression.name, at: scope.last()},
      to: eGraph.lastAdded!,
      type: 'decorate',
      location: toENRELocation(path.node.expression.loc),
    });
  }
};
