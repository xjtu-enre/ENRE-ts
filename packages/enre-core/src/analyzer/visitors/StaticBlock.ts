/**
 * StaticBlock
 *
 * Extracted entities:
 *   * Block (Class static block)
 */

import {ENREContext} from '../context';
import {NodePath} from '@babel/traverse';
import {StaticBlock} from '@babel/types';
import {recordEntityBlock} from '@enre-ts/data';
import {toENRELocation} from '@enre-ts/location';

type PathType = NodePath<StaticBlock>

export default {
  enter: (path: PathType, {file: {logs}, scope}: ENREContext) => {
    const entity = recordEntityBlock(
      'class-static-block',
      /**
       *        V Expected start column
       * static {
       * ^
       * @babel/parser's start column
       *
       * FIXME: Start column of class static block is not correct
       */
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
