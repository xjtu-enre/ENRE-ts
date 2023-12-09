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
import {eGraph, ENRERelationDecorate, pseudoR} from '@enre-ts/data';
import {toENRELocation} from '@enre-ts/location';

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
