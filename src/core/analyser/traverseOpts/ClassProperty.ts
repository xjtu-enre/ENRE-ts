/**
 * ClassProperty|ClassPrivateProperty
 *
 * Extractable entity:
 *   * Field
 */

import {ENREEntityCollectionScoping} from '../entities';
import {NodePath} from '@babel/traverse';
import {ClassPrivateProperty, ClassProperty, PrivateName, SourceLocation} from '@babel/types';
import {buildENREName, ENRENameModified} from '../../utils/nameHelper';
import {ENREEntityField, recordEntityField} from '../entities/eField';
import {toENRELocation, ToENRELocationPolicy} from '../../utils/locationHelper';
import {debug, verbose, warn} from '../../utils/cliRender';

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
      verbose('Record Entity Field: ' + entity.name.printableName);
    }
  };
};
