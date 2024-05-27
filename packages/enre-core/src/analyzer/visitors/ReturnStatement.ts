/**
 * ReturnStatement|YieldStatement
 */

import {ENREContext} from '../context';
import {NodePath} from '@babel/traverse';
import {ReturnStatement} from '@babel/types';
import expressionHandler from './common/expression-handler';

type PathType = NodePath<ReturnStatement>

export default (path: PathType, {file: {logs}, scope}: ENREContext) => {
  const callableEntity = scope.last();

  if (callableEntity.type !== 'function') {
    return;
  }

  if (!path.node.argument) {
    return;
  }

  const task = expressionHandler(path.node.argument, scope);
  if (task) {
    task.onFinish = (symbolSnapshot) => {
      /**
       * The return statement is strictly bind to its declaration function body,
       * thus will always be the first callable of the first pointsTo item
       * in the callable array.
       */
      callableEntity.pointsTo[0].callable[0].returns.push(...symbolSnapshot);
    };
  }
};
