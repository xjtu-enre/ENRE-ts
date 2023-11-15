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
import {UpdateExpression} from '@babel/types';
import {ENRERelationModify, pseudoR} from '@enre/data';
import {toENRELocation} from '@enre/location';
import {ENREContext} from '../context';

type PathType = NodePath<UpdateExpression>

export default (path: PathType, {scope}: ENREContext) => {
  if (path.node.argument.type === 'Identifier') {
    pseudoR.add<ENRERelationModify>({
      type: 'modify',
      from: scope.last(),
      to: {role: 'value', identifier: path.node.argument.name, at: scope.last()},
      location: toENRELocation(path.node.argument.loc),
    });
  }
};

// TODO: Move to expression-handler
