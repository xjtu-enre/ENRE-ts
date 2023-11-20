/**
 * ReturnStatement
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
  task.onFinish = (any: any) => {
    callableEntity.pointsTo[0].callable.push(any);
  };
};
