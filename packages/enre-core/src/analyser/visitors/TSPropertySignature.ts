/**
 * TSPropertySignature
 *
 * Extracted entities:
 *   * Property
 */

import {NodePath} from '@babel/traverse';
import {SourceLocation, TSPropertySignature} from '@babel/types';
import {ENREEntityCollectionInFile, ENREEntityProperty, recordEntityProperty} from '@enre/container';
import {toENRELocation} from '@enre/location';
import {verbose, warn} from '@enre/logging';
import {buildENREName, ENRENameModified} from '@enre/naming';
import {ENREContext} from '../context';

export default ({scope}: ENREContext) => {
  return (path: NodePath<TSPropertySignature>) => {
    let entity: ENREEntityProperty;

    switch (path.node.key.type) {
      case 'Identifier':
        entity = recordEntityProperty(
          buildENREName(path.node.key.name),
          toENRELocation(path.node.key.loc as SourceLocation),
          scope.last(),
        );
        break;

      // TODO: If a string literal has the same content as a numeric literal, an warning should raise
      case 'StringLiteral':
        entity = recordEntityProperty(
          buildENREName<ENRENameModified>({
            raw: path.node.key.value,
            as: 'StringLiteral',
          }),
          toENRELocation(path.node.key.loc as SourceLocation),
          scope.last(),
        );
        break;

      case 'NumericLiteral':
        entity = recordEntityProperty(
          buildENREName<ENRENameModified>({
            raw: path.node.key.extra?.raw as string || (warn('Encounter a NumericLiteral node without extra.raw'), ''),
            as: 'NumericLiteral',
            value: path.node.key.value.toString(),
          }),
          toENRELocation(path.node.key.loc as SourceLocation),
          scope.last(),
        );
        break;

      default:
      // WONT-FIX: Extract name from other expressions
    }

    verbose('Record Entity Property: ' + entity!.name.printableName);

    /**
     * Entity will not be undefined for sure, since there are only 2 cases,
     * which are all been switched
     */
    (scope.last().children as ENREEntityCollectionInFile[]).push(entity!);
  };
};
