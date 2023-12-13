/**
 * ClassMethod|ClassPrivateMethod
 *
 * Extracted entities:
 *   * Method
 *   * Parameter
 *   * Field
 */

import {NodePath} from '@babel/traverse';
import {
  ClassMethod,
  ClassPrivateMethod,
  PrivateName,
  TSDeclareMethod
} from '@babel/types';
import {
  ENREEntityClass,
  ENREEntityCollectionAnyChildren,
  ENREEntityField,
  ENREEntityMethod,
  ENRELogEntry,
  recordEntityField,
  recordEntityMethod,
} from '@enre-ts/data';
import {ENRELocation, toENRELocation, ToENRELocationPolicy} from '@enre-ts/location';
import ENREName from '@enre-ts/naming';
import {ENREContext} from '../context';
import {TSVisibility} from '@enre-ts/shared';
import {ENREScope} from '../context/scope';
import parameterHandler from './common/parameter-handler';
import {createJSObjRepr} from './common/literal-handler';

const onRecordField = (name: string, location: ENRELocation, scope: ENREScope, TSVisibility: TSVisibility): ENREEntityField => {
  const entity = recordEntityField(
    new ENREName('Norm', name),
    location,
    // Scope stack: ... -> (-2) Class -> (-1) Constructor, field needs to be added to `Class`.
    scope.at(-2) as ENREEntityClass,
    // Any other properties are all false
    {
      isStatic: false,
      isPrivate: false,
      isAbstract: false,
      TSVisibility
    },
  );


  (scope.at(-2) as ENREEntityClass).children.push(entity);

  return entity;
};

let entity: ENREEntityMethod | undefined;

type PathType = NodePath<ClassMethod | ClassPrivateMethod | TSDeclareMethod>

export default {
  enter: (path: PathType, {file: {lang, logs}, scope}: ENREContext) => {
    const classEntity = scope.last<ENREEntityClass>();

    const key = path.node.key;

    if (path.node.abstract && !classEntity.isAbstract) {
      logs.add(path.node.loc!.start.line, ENRELogEntry['Abstract methods can only appear within an abstract class']);
      return;
    }

    if (path.node.type === 'ClassPrivateMethod') {
      if (path.node.accessibility) {
        logs.add(path.node.loc!.start.line, ENRELogEntry['An accessibility modifier cannot be used with a private identifier']);
        return;
      }
      if (path.node.abstract) {
        logs.add(path.node.loc!.start.line, ENRELogEntry['abstract modifier cannot be used with a private identifier']);
        return;
      }

      entity = recordEntityMethod(
        new ENREName('Pvt', (key as PrivateName).id.name),
        toENRELocation(key.loc, ToENRELocationPolicy.PartialEnd),
        classEntity,
        {
          /**
           * PrivateMethod may not be a class constructor,
           * maybe this type annotation of babel is inaccurate.
           */
          kind: path.node.kind,
          isStatic: path.node.static,
          isPrivate: true,
          isGenerator: path.node.generator,
          isAsync: path.node.async,
        },
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

        if (path.node.kind === 'constructor') {
          logs.add(path.node.loc!.start.line, ENRELogEntry['Constructor cannot be abstract']);
          return;
        }

        // TODO: Determine whether a method is an async / generator method according to its return type signature.
        if (path.node.async) {
          logs.add(path.node.loc!.start.line, ENRELogEntry['0 modifier cannot be used with 1 modifier'], 'async', 'abstract');
          return;
        }

        if (path.node.generator) {
          logs.add(path.node.loc!.start.line, ENRELogEntry['An overload signature cannot be declared as a generator']);
          return;
        }
      }

      switch (key.type) {
        case 'Identifier':
          entity = recordEntityMethod(
            new ENREName('Norm', key.name),
            toENRELocation(key.loc),
            classEntity,
            {
              kind: path.node.kind,
              isStatic: path.node.static,
              isGenerator: path.node.generator,
              isAsync: path.node.async,
              isAbstract: path.node.abstract ?? false,
              TSVisibility: path.node.accessibility ?? (lang === 'ts' ? 'public' : undefined),
            },
          );
          break;
        case 'StringLiteral':
          entity = recordEntityMethod(
            new ENREName<'Str'>('Str', key.value),
            toENRELocation(key.loc),
            classEntity,
            {
              kind: path.node.kind,
              isStatic: path.node.static,
              isGenerator: path.node.generator,
              isAsync: path.node.async,
              isAbstract: path.node.abstract ?? false,
              TSVisibility: path.node.accessibility ?? (lang === 'ts' ? 'public' : undefined),
            },
          );
          break;
        case 'NumericLiteral':
          entity = recordEntityMethod(
            new ENREName<'Num'>('Num', key.extra?.raw as string, key.value),
            toENRELocation(key.loc),
            classEntity,
            {
              /**
               * In the case of a NumericLiteral, this will never be a constructor method.
               */
              kind: path.node.kind as 'get' | 'set' | 'method',
              isStatic: path.node.static,
              isGenerator: path.node.generator,
              isAsync: path.node.async,
              isAbstract: path.node.abstract ?? false,
              TSVisibility: path.node.accessibility ?? (lang === 'ts' ? 'public' : undefined),
            },
          );
          break;
        default:
        // WONT-FIX: Extract name from dynamic expressions.
      }
    }

    if (entity) {
      // The JSObjRepr of this method
      const objRepr = createJSObjRepr('obj');
      objRepr.callable.push({entity, returns: []});
      entity.pointsTo.push(objRepr);
      // Set method's JSObjRepr as its belonging class entity's JSObjRepr's kv
      classEntity.pointsTo[0].kv[entity.name.codeName] = objRepr;

      // Set `callable` of its belonging class entity's JSObjRepr if this is a constructor
      if (entity.name.payload === 'constructor') {
        // TODO: Class constructor's return value?
        // [Return Overriding] https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/constructor#
        classEntity.pointsTo[0].callable.push({
          entity,
          returns: [classEntity],
        });
      }

      scope.last<ENREEntityCollectionAnyChildren>().children.push(entity);
      scope.push(entity);

      parameterHandler(path.node, scope, logs, onRecordField);
    }
  },

  exit: (path: PathType, {scope}: ENREContext) => {
    /**
     * Pop the last scope element ONLY IF a method entity is successfully created.
     */
    if (entity) {
      scope.pop();
      entity = undefined;
    }
  },
};
