/**
 * ClassMethod|ClassPrivateMethod|TSDeclareMethod
 *
 * Extracted entities:
 *   * Method
 *   * Parameter
 *   * Field
 */

import {NodePath} from '@babel/traverse';
import {ClassMethod, ClassPrivateMethod, PrivateName, TSDeclareMethod} from '@babel/types';
import {
  ENREEntityClass,
  ENREEntityCollectionAnyChildren,
  ENREEntityMethod,
  ENREEntityParameter,
  ENRELogEntry,
  id,
  recordEntityField,
  recordEntityMethod,
  recordEntityParameter,
} from '@enre/data';
import {ENRELocation, toENRELocation, ToENRELocationPolicy} from '@enre/location';
import ENREName from '@enre/naming';
import {ENREContext} from '../context';
import traverseBindingPattern from './common/traverseBindingPattern';
import {TSVisibility} from '@enre/shared';

const onRecordParameter = (name: string, location: ENRELocation, scope: ENREContext['scope']) => {
  const entity = recordEntityParameter(
    new ENREName('Norm', name),
    location,
    scope.last(),
    {path: ''},
  );

  scope.last<ENREEntityMethod>().children.push(entity);

  return entity;
};

const onRecordField = (name: string, location: ENRELocation, scope: ENREContext['scope'], TSVisibility: TSVisibility) => {
  const entity = recordEntityField(
    new ENREName('Norm', name),
    location,
    // Scope stack: ... -> (-2) Class -> (-1) Constructor, field needs to be added to `Class`.
    scope.at(-2) as id<ENREEntityClass>,
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

let entity: id<ENREEntityMethod> | undefined;

type PathType = NodePath<ClassMethod | ClassPrivateMethod | TSDeclareMethod>

export default {
  enter: (path: PathType, {file: {lang, logs}, scope}: ENREContext) => {
    const key = path.node.key;

    if (path.node.abstract && !scope.last<ENREEntityClass>().isAbstract) {
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
        scope.last<id<ENREEntityClass>>(),
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
            scope.last<id<ENREEntityClass>>(),
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
            scope.last<id<ENREEntityClass>>(),
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
            scope.last<id<ENREEntityClass>>(),
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
      scope.last<ENREEntityCollectionAnyChildren>().children.push(entity);
      scope.push(entity);

      for (const param of path.node.params) {
        if (param.type === 'Identifier' && param.name === 'this') {
          continue;
        } else if (path.node.kind === 'constructor' && param.type === 'TSParameterProperty') {
          traverseBindingPattern<id<ENREEntityParameter>>(
            param,
            scope,
            onRecordParameter,
            onRecordField,
          );
        } else if (param.type === 'TSParameterProperty') {
          logs.add(path.node.loc!.start.line, ENRELogEntry['A parameter field is only allowed in a constructor implementation']);
          /**
           * In this case, only (and should only) extract parameter entities.
           * By not sending onRecordField, the function will not record any field entities.
           */
          traverseBindingPattern<id<ENREEntityParameter>>(
            param,
            scope,
            onRecordParameter,
          );
        } else {
          traverseBindingPattern<id<ENREEntityParameter>>(
            param,
            scope,
            onRecordParameter,
          );
        }
      }
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
