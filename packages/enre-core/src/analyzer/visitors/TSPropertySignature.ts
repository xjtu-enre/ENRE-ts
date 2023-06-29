/**
 * TSPropertySignature
 *
 * Extracted entities:
 *   * Property
 */

import {NodePath} from '@babel/traverse';
import {TSPropertySignature} from '@babel/types';
import {ENREEntityCollectionAnyChildren, ENREEntityProperty, recordEntityProperty} from '@enre/data';
import {toENRELocation} from '@enre/location';
import ENREName from '@enre/naming';
import {ENREContext} from '../context';

type PathType = NodePath<TSPropertySignature>

export default (path: PathType, {scope}: ENREContext) => {
  let entity: ENREEntityProperty | undefined = undefined;

  switch (path.node.key.type) {
    case 'Identifier':
      entity = recordEntityProperty(
        new ENREName('Norm', path.node.key.name),
        toENRELocation(path.node.key.loc),
        scope.last(),
      );
      break;

    // TODO: If a string literal has the same content as a numeric literal, an warning should raise
    case 'StringLiteral':
      entity = recordEntityProperty(
        new ENREName('Str', path.node.key.value),
        toENRELocation(path.node.key.loc),
        scope.last(),
      );
      break;

    case 'NumericLiteral':
      entity = recordEntityProperty(
        new ENREName('Num', path.node.key.extra?.raw as string, path.node.key.value),
        toENRELocation(path.node.key.loc),
        scope.last(),
      );
      break;

    default:
    // WONT-FIX: Extract name from other expressions
  }

  if (entity) {
    scope.last<ENREEntityCollectionAnyChildren>().children.push(entity);
  }
};
