/**
 * ThrowStatement
 */

import {ENREContext} from '../context';
import {NodePath} from '@babel/traverse';
import {ThrowStatement} from '@babel/types';
import expressionHandler from './common/expression-handler';

type PathType = NodePath<ThrowStatement>

export default (path: PathType, {file: {logs}, scope}: ENREContext) => {
  if (!path.node.argument) {
    return;
  }

  expressionHandler(path.node.argument, scope);
};
