/**
 * ExpressionStatement
 *
 * This hook does not extract any entity/relation,
 * but only convert AST to token stream (IR) for later use.
 *
 * Extracted entities:
 *   * N/A
 *
 * Extracted relations:
 *   * N/A
 */

import {NodePath} from '@babel/traverse';
import {ExpressionStatement} from '@babel/types';
import {ENREContext} from '../context';
import expressionHandler from './common/expressionHandler';

type PathType = NodePath<ExpressionStatement>

export default (path: PathType, {scope}: ENREContext) => {
  expressionHandler(path.node.expression, scope);
};
