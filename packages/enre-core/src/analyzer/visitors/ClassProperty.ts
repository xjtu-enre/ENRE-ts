/**
 * ClassProperty|ClassPrivateProperty
 *
 * Extracted entities:
 *   * Field
 *   * Method
 */

import {NodePath} from '@babel/traverse';
import {ClassPrivateProperty, ClassProperty, PrivateName} from '@babel/types';
import {ENREEntityClass, ENREEntityField, ENRELogEntry, id, recordEntityField} from '@enre/data';
import {toENRELocation, ToENRELocationPolicy} from '@enre/location';
import ENREName from '@enre/naming';
import {ENREContext} from '../context';

type PathType = NodePath<ClassProperty | ClassPrivateProperty>

export default (path: PathType, {file: {lang, logs}, scope}: ENREContext) => {
  const key = path.node.key;

  let entity: id<ENREEntityField> | undefined;

  // @ts-ignore
  if (path.node.abstract && !scope.last<ENREEntityClass>().isAbstract) {
    logs.add(path.node.loc!.start.line, ENRELogEntry['Abstract fields can only appear within an abstract class']);
    return;
  }

  if (path.node.type === 'ClassPrivateProperty') {
    // @ts-ignore
    if (path.node.accessibility) {
      logs.add(path.node.loc!.start.line, ENRELogEntry['An accessibility modifier cannot be used with a private identifier']);
      return;
    }
    // @ts-ignore
    if (path.node.abstract) {
      logs.add(path.node.loc!.start.line, ENRELogEntry['abstract modifier cannot be used with a private identifier']);
      return;
    }

    entity = recordEntityField(
      new ENREName<'Pvt'>('Pvt', (key as PrivateName).id.name),
      toENRELocation(key.loc, ToENRELocationPolicy.PartialEnd),
      scope.last<id<ENREEntityClass>>(),
      {
        isStatic: path.node.static,
        isPrivate: true,
      }
    );
  } else {
    if (path.node.abstract) {
      if (path.node.accessibility === 'private') {
        // Only `private` modifier is disabled for abstract field.
        logs.add(path.node.loc!.start.line, ENRELogEntry['0 modifier cannot be used with 1 modifier'], 'private', 'abstract');
        return;
      }

      if (path.node.static) {
        logs.add(path.node.loc!.start.line, ENRELogEntry['0 modifier cannot be used with 1 modifier'], 'static', 'abstract');
        return;
      }
    }

    switch (key.type) {
      case 'Identifier':
        entity = recordEntityField(
          new ENREName('Norm', key.name),
          toENRELocation(key.loc),
          scope.last<id<ENREEntityClass>>(),
          {
            isStatic: path.node.static ?? false,
            isAbstract: path.node.abstract ?? false,
            TSVisibility: path.node.accessibility ?? (lang === 'ts' ? 'public' : undefined),
          }
        );
        break;
      case 'StringLiteral':
        entity = recordEntityField(
          new ENREName<'Str'>('Str', key.value),
          toENRELocation(key.loc),
          scope.last<id<ENREEntityClass>>(),
          {
            isStatic: path.node.static ?? false,
            isAbstract: path.node.abstract ?? false,
            TSVisibility: path.node.accessibility ?? (lang === 'ts' ? 'public' : undefined),
          },
        );
        break;
      case 'NumericLiteral':
        entity = recordEntityField(
          new ENREName<'Num'>('Num', key.extra?.raw as string, key.value),
          toENRELocation(key.loc),
          scope.last<id<ENREEntityClass>>(),
          {
            isStatic: path.node.static ?? false,
            isAbstract: path.node.abstract ?? false,
            TSVisibility: path.node.accessibility ?? (lang === 'ts' ? 'public' : undefined),
          },
        );
        break;
      default:
      // WONT-FIX: Extract name from a lot of expression kinds.
    }
  }

  if (entity) {
    scope.last<ENREEntityField>().children.push(entity);
  }
};
