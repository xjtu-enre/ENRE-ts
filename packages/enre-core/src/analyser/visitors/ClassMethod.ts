/**
 * ClassMethod|ClassPrivateMethod
 *
 * Extracted entities:
 *   * Method
 *   * Parameter
 */

import {NodePath} from '@babel/traverse';
import {ClassMethod, ClassPrivateMethod, PrivateName, SourceLocation} from '@babel/types';
import {
  ENREEntityCollectionScoping,
  ENREEntityMethod,
  ENREEntityParameter,
  recordEntityMethod,
  recordEntityParameter
} from '@enre/container';
import {ENRELocation, toENRELocation, ToENRELocationPolicy} from '@enre/location';
import {verbose, warn} from '@enre/logging';
import {buildENREName, ENRENameModified} from '@enre/naming';
import handleBindingPatternRecursively from './common/handleBindingPatternRecursively';

const onRecord = (name: string, location: ENRELocation, scope: Array<ENREEntityCollectionScoping>) => {
  const entity = recordEntityParameter(
    buildENREName(name),
    location,
    scope[scope.length - 1],
  );

  scope.at(-1)!.children.add(entity);

  return entity;
};

const onLog = (entity: ENREEntityParameter) => {
  verbose('Record Entity Parameter: ' + entity.name.printableName);
};

export default (scope: Array<ENREEntityCollectionScoping>) => {
  return {
    enter: (path: NodePath<ClassMethod | ClassPrivateMethod>) => {
      const key = path.node.key;

      let entity: ENREEntityMethod | undefined;

      if (path.node.type === 'ClassPrivateMethod') {
        entity = recordEntityMethod(
          buildENREName<ENRENameModified>({
            raw: (key as PrivateName).id.name,
            as: 'PrivateIdentifier',
          }),
          toENRELocation(key.loc as SourceLocation, ToENRELocationPolicy.PartialEnd),
          scope[scope.length - 1],
          {
            /**
             * Group `method` and `constructor` together,
             * this might be changed in the future.
             */
            kind: path.node.kind === 'constructor' ? 'method' : path.node.kind,
            isStatic: path.node.static,
            isPrivate: true,
            isGenerator: path.node.generator,
            isAsync: path.node.async,
          },
        );
      } else {
        switch (key.type) {
          case 'Identifier':
            entity = recordEntityMethod(
              buildENREName(key.name),
              toENRELocation(key.loc as SourceLocation),
              scope[scope.length - 1],
              {
                kind: path.node.kind === 'constructor' ? 'method' : path.node.kind,
                isStatic: path.node.static,
                isGenerator: path.node.generator,
                isAsync: path.node.async,
              },
            );
            break;
          case 'StringLiteral':
            entity = recordEntityMethod(
              buildENREName<ENRENameModified>({
                raw: key.value,
                as: 'StringLiteral',
              }),
              toENRELocation(key.loc as SourceLocation),
              scope[scope.length - 1],
              {
                kind: path.node.kind === 'constructor' ? 'method' : path.node.kind,
                isStatic: path.node.static,
                isGenerator: path.node.generator,
                isAsync: path.node.async,
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
              toENRELocation(key.loc as SourceLocation),
              scope[scope.length - 1],
              {
                /**
                 * In the case of a NumericLiteral, this will never be a constructor method.
                 */
                kind: path.node.kind as 'get' | 'set' | 'method',
                isStatic: path.node.static,
                isGenerator: path.node.generator,
                isAsync: path.node.async,
              },
            );
            break;
          default:
          // WONT-FIX: Extract name from a lot of expression kinds.
        }
      }

      if (entity) {
        verbose('Record Entity Method: ' + entity.name.printableName);

        scope.at(-1)!.children.add(entity);
        scope.push(entity);

        for (const param of path.node.params) {
          handleBindingPatternRecursively<ENREEntityParameter>(
            param,
            scope,
            onRecord,
            onLog,
          );
        }
      }
    },

    exit: () => {
      scope.pop();
    },
  };
};
