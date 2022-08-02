/**
 * ClassProperty|ClassPrivateProperty
 *
 * Extracted entities:
 *   * Field
 *   * Method
 */

import {NodePath} from '@babel/traverse';
import {ClassPrivateProperty, ClassProperty, PrivateName, SourceLocation} from '@babel/types';
import {ENREEntityClass, ENREEntityCollectionInFile, ENREEntityField, recordEntityField} from '@enre/container';
import {toENRELocation, ToENRELocationPolicy} from '@enre/location';
import {error, verbose, warn} from '@enre/logging';
import {buildENREName, ENRENameModified} from '@enre/naming';
import {ENREContext} from '../context';

export default ({file: {lang}, scope}: ENREContext) => {
  return (path: NodePath<ClassProperty | ClassPrivateProperty>) => {
    const key = path.node.key;

    let entity: ENREEntityField | undefined;

    // @ts-ignore
    if (path.node.abstract && !scope.last<ENREEntityClass>().isAbstract) {
      error('Abstract fields can only appear within an abstract class.');
      return;
    }

    if (path.node.type === 'ClassPrivateProperty') {
      // @ts-ignore
      if (path.node.accessibility) {
        error('TSError: An accessibility modifier cannot be used with a private identifier.');
        return;
      }
      // @ts-ignore
      if (path.node.abstract) {
        error('TSError: \'abstract\' modifier cannot be used with a private identifier.');
        return;
      }

      entity = recordEntityField(
        buildENREName<ENRENameModified>({
          raw: (key as PrivateName).id.name,
          as: 'PrivateIdentifier',
        }),
        toENRELocation(key.loc as SourceLocation, ToENRELocationPolicy.PartialEnd),
        scope.last<ENREEntityClass>(),
        {
          isStatic: path.node.static,
          isPrivate: true,
        }
      );
    } else {
      if (path.node.abstract) {
        if (path.node.accessibility === 'private') {
          // Only `private` modifier is disabled for abstract field.
          error('TSError: \'private\' modifier cannot be used with \'abstract\' modifier.');
          return;
        }

        if (path.node.static) {
          error('TSError: \'static\' modifier cannot be used with \'abstract\' modifier.');
          return;
        }
      }

      switch (key.type) {
        case 'Identifier':
          entity = recordEntityField(
            buildENREName(key.name),
            toENRELocation(key.loc as SourceLocation),
            scope.last<ENREEntityClass>(),
            {
              isStatic: path.node.static ?? false,
              isAbstract: path.node.abstract ?? false,
              TSModifier: path.node.accessibility ?? (lang === 'ts' ? 'public' : undefined),
            }
          );
          break;
        case 'StringLiteral':
          entity = recordEntityField(
            buildENREName<ENRENameModified>({
              raw: key.value,
              as: 'StringLiteral',
            }),
            toENRELocation(key.loc as SourceLocation),
            scope.last<ENREEntityClass>(),
            {
              isStatic: path.node.static ?? false,
              isAbstract: path.node.abstract ?? false,
              TSModifier: path.node.accessibility ?? (lang === 'ts' ? 'public' : undefined),
            },
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
            scope.last<ENREEntityClass>(),
            {
              isStatic: path.node.static ?? false,
              isAbstract: path.node.abstract ?? false,
              TSModifier: path.node.accessibility ?? (lang === 'ts' ? 'public' : undefined),
            },
          );
          break;
        default:
        // WONT-FIX: Extract name from a lot of expression kinds.
      }
    }

    if (entity) {
      (scope.last().children as ENREEntityCollectionInFile[]).push(entity);
      verbose('Record Entity Field: ' + entity.name.printableName);
    }
  };
};
