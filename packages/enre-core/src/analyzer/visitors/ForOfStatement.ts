/**
 * ForOfStatement
 *
 * Extracted entities:
 *   * Block
 */
import {NodePath} from '@babel/traverse';
import {ForOfStatement} from '@babel/types';
import {ENREContext} from '../context';
import {recordEntityBlock} from '@enre-ts/data';
import {toENRELocation} from '@enre-ts/location';

type PathType = NodePath<ForOfStatement>

export default {
  enter: (path: PathType, {file: {logs}, scope}: ENREContext) => {
    const entity = recordEntityBlock(
      'any',
      toENRELocation(path.node.loc),
      scope.last(),
    );
    scope.last().children.push(entity);
    scope.push(entity);
  },

  exit: (path: PathType, {scope}: ENREContext) => {
    scope.pop();
  },
};
