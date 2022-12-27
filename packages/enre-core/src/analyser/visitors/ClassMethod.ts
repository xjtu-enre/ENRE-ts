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
  ENREEntityCollectionInFile,
  ENREEntityField,
  ENREEntityMethod,
  ENREEntityParameter,
  recordEntityField,
  recordEntityMethod,
  recordEntityParameter,
  TSModifier
} from '@enre/container';
import {ENRELocation, toENRELocation, ToENRELocationPolicy} from '@enre/location';
import {error, verbose, warn} from '@enre/logging';
import {buildENREName, ENRENameModified} from '@enre/naming';
import {ENREContext} from '../context';
import traverseBindingPattern from './common/traverseBindingPattern';
import {ENREi18nen_US} from '../../i18n/en_US/ts-compiling';
import {lastOf} from '../context/scope';

const onRecordParameter = (name: string, location: ENRELocation, scope: ENREContext['scope']) => {
  const entity = recordEntityParameter(
    buildENREName(name),
    location,
    lastOf(scope),
  );

  (lastOf(scope).children as ENREEntityCollectionInFile[]).push(entity);

  return entity;
};

const onLogParameter = (entity: ENREEntityParameter) => {
  verbose('Record Entity Parameter: ' + entity.name.printableName);
};

const onRecordField = (name: string, location: ENRELocation, scope: ENREContext['scope'], TSModifier: TSModifier) => {
  const entity = recordEntityField(
    buildENREName(name),
    location,
    // Scope stack: ... -> (-2) Class -> (-1) Constructor, field needs to be added to `Class`.
    scope.at(-2) as ENREEntityClass,
    // Any other properties are all false
    {TSModifier},
  );

  ((scope.at(-2) as ENREEntityClass).children as ENREEntityCollectionInFile[]).push(entity);

  return entity;
};

const onLogField = (entity: ENREEntityField) => {
  verbose('Record Entity Field: ' + entity.name.printableName);
};

let entity: ENREEntityMethod | undefined;

export default ({file: {lang}, scope}: ENREContext) => {
  return {
    enter: (path: NodePath<ClassMethod | ClassPrivateMethod | TSDeclareMethod>) => {
      const key = path.node.key;

      if (path.node.abstract && !lastOf<ENREEntityClass>(scope).isAbstract) {
        error(ENREi18nen_US['Abstract methods can only appear within an abstract class']);
        return;
      }

      if (path.node.type === 'ClassPrivateMethod') {
        // @ts-ignore
        if (path.node.accessibility) {
          error(ENREi18nen_US['An accessibility modifier cannot be used with a private identifier']);
          return;
        }
        // @ts-ignore
        if (path.node.abstract) {
          error(ENREi18nen_US['abstract modifier cannot be used with a private identifier']);
          return;
        }

        entity = recordEntityMethod(
          buildENREName<ENRENameModified>({
            raw: (key as PrivateName).id.name,
            as: 'PrivateIdentifier',
          }),
          toENRELocation(key.loc, ToENRELocationPolicy.PartialEnd),
          lastOf<ENREEntityClass>(scope),
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
            error(ENREi18nen_US['0 modifier cannot be used with 1 modifier'].formatENRE('private', 'abstract'));
            return;
          }

          if (path.node.static) {
            error(ENREi18nen_US['0 modifier cannot be used with 1 modifier'].formatENRE('static', 'abstract'));
            return;
          }

          if (path.node.kind === 'constructor') {
            error(ENREi18nen_US['Constructor cannot be abstract']);
            return;
          }

          // TODO: Determine whether a method is an async / generator method according to its return type signature.
          if (path.node.async) {
            error(ENREi18nen_US['0 modifier cannot be used with 1 modifier'].formatENRE('async', 'abstract'));
            return;
          }

          if (path.node.generator) {
            error(ENREi18nen_US['An overload signature cannot be declared as a generator']);
            return;
          }
        }

        switch (key.type) {
          case 'Identifier':
            entity = recordEntityMethod(
              buildENREName(key.name),
              toENRELocation(key.loc),
              lastOf<ENREEntityClass>(scope),
              {
                kind: path.node.kind,
                isStatic: path.node.static,
                isGenerator: path.node.generator,
                isAsync: path.node.async,
                isAbstract: path.node.abstract ?? false,
                TSModifier: path.node.accessibility ?? (lang === 'ts' ? 'public' : undefined),
              },
            );
            break;
          case 'StringLiteral':
            entity = recordEntityMethod(
              buildENREName<ENRENameModified>({
                raw: key.value,
                as: 'StringLiteral',
              }),
              toENRELocation(key.loc),
              lastOf<ENREEntityClass>(scope),
              {
                kind: path.node.kind,
                isStatic: path.node.static,
                isGenerator: path.node.generator,
                isAsync: path.node.async,
                isAbstract: path.node.abstract ?? false,
                TSModifier: path.node.accessibility ?? (lang === 'ts' ? 'public' : undefined),
              },
            );
            break;
          case 'NumericLiteral':
            entity = recordEntityMethod(
              buildENREName<ENRENameModified>({
                raw: key.extra?.raw as string || (warn('Encounter a NumericLiteral node without extra.raw'), ''),
                as: 'NumericLiteral',
                value: key.value.toString(),
              }),
              toENRELocation(key.loc),
              lastOf<ENREEntityClass>(scope),
              {
                /**
                 * In the case of a NumericLiteral, this will never be a constructor method.
                 */
                kind: path.node.kind as 'get' | 'set' | 'method',
                isStatic: path.node.static,
                isGenerator: path.node.generator,
                isAsync: path.node.async,
                isAbstract: path.node.abstract ?? false,
                TSModifier: path.node.accessibility ?? (lang === 'ts' ? 'public' : undefined),
              },
            );
            break;
          default:
          // WONT-FIX: Extract name from dynamic expressions.
        }
      }

      if (entity) {
        verbose('Record Entity Method: ' + entity.name.printableName);

        (lastOf(scope).children as ENREEntityCollectionInFile[]).push(entity);
        scope.push(entity);

        for (const param of path.node.params) {
          if (path.node.kind === 'constructor' && param.type === 'TSParameterProperty') {
            traverseBindingPattern<ENREEntityParameter>(
              param,
              scope,
              onRecordParameter,
              onLogParameter,
              onRecordField,
              onLogField,
            );
          } else if (param.type === 'TSParameterProperty') {
            error(ENREi18nen_US['A parameter field is only allowed in a constructor implementation']);
            /**
             * In this case, only (and should only) extract parameter entities.
             * By not sending onRecordField, the function will not record any field entities.
             */
            traverseBindingPattern<ENREEntityParameter>(
              param,
              scope,
              onRecordParameter,
              onLogParameter,
            );
          } else {
            traverseBindingPattern<ENREEntityParameter>(
              param,
              scope,
              onRecordParameter,
              onLogParameter,
            );
          }
        }
      }
    },

    exit: () => {
      /**
       * Only pop the last scope element ONLY IF a method entity is successfully created.
       */
      if (entity) {
        scope.pop();
        entity = undefined;
      }
    },
  };
};
