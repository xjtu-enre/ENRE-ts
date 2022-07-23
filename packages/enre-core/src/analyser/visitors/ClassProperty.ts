/**
 * ClassProperty|ClassPrivateProperty
 *
 * Extracted entities:
 *   * Field
 */

import {NodePath} from '@babel/traverse';
import {ClassPrivateProperty, ClassProperty, PrivateName, SourceLocation} from '@babel/types';
import {ENREEntityCollectionScoping, ENREEntityField, recordEntityField} from '@enre/container';
import {toENRELocation, ToENRELocationPolicy} from '@enre/location';
import {verbose, warn} from '@enre/logging';
import {buildENREName, ENRENameModified} from '@enre/naming';

export default (scope: Array<ENREEntityCollectionScoping>) => {
  return (path: NodePath<ClassProperty | ClassPrivateProperty>) => {
    const key = path.node.key;

    let entity: ENREEntityField | undefined;

    if (path.node.type === 'ClassPrivateProperty') {
      entity = recordEntityField(
        buildENREName<ENRENameModified>({
          raw: (key as PrivateName).id.name,
          as: 'PrivateIdentifier',
        }),
        toENRELocation(key.loc as SourceLocation, ToENRELocationPolicy.PartialEnd),
        scope[scope.length - 1],
        path.node.static,
        true,
      );
    } else {
      switch (key.type) {
        case 'Identifier':
          entity = recordEntityField(
            buildENREName(key.name),
            toENRELocation(key.loc as SourceLocation),
            scope[scope.length - 1],
            path.node.static,
          );
          break;
        case 'StringLiteral':
          entity = recordEntityField(
            buildENREName<ENRENameModified>({
              raw: key.value,
              as: 'StringLiteral',
            }),
            toENRELocation(key.loc as SourceLocation),
            scope[scope.length - 1],
            path.node.static,
          );
          break;
        case 'NumericLiteral':
          entity = recordEntityField(
            buildENREName<ENRENameModified>({
              raw: key.extra?.raw as string || (warn('Encounter a NumericLiteral node without extra.raw'), ''),
              as: 'NumericLiteral',
              value: key.value.toString(),
            }),
            toENRELocation(key.loc as SourceLocation),
            scope[scope.length - 1],
            path.node.static,
          );
          break;
        default:
        // WONT-FIX: Extract name from a lot of expression kinds.
      }
    }

    if (entity) {
      scope.at(-1)!.children.add(entity);
      verbose('Record Entity Field: ' + entity.name.printableName);
    }
  };
};
