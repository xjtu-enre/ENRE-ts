/**
 * CatchClause
 *
 * Extracted entities:
 *   * Parameter
 */

import {NodePath} from '@babel/traverse';
import {CatchClause} from '@babel/types';
import {ENREContext} from '../context';
import parameterHandler from './common/parameter-handler';

type PathType = NodePath<CatchClause>

export default {
  enter: (path: PathType, {file: {logs}, scope}: ENREContext) => {
    parameterHandler(path.node, scope, logs);
  },

  exit: (path: PathType, {scope}: ENREContext) => {
    // scope.pop();
  }
};
