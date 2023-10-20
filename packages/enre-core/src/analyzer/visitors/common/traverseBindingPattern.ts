// @ts-nocheck

import {LVal, PatternLike, TSParameterProperty} from '@babel/types';
import {ENREEntityField, ENREEntityParameter, ENREEntityVariable} from '@enre/data';
import {ENRELocation, toENRELocation} from '@enre/location';
import {ENREContext} from '../../context';
import {TSVisibility} from '@enre/shared';
import {ENREScope} from '../../context/scope';

type PossibleEntityTypes = ENREEntityVariable | ENREEntityParameter;

type BindingRepr<T extends PossibleEntityTypes> = { path: BindingPath, entity: T | ENREEntityField };

type BindingPath = (
  BindingPathStart
  | BindingPathObj
  | BindingPathObjKey
  | BindingPathObjRest
  | BindingPathArray
  | BindingPathArrayIndex
  | BindingPathArrayRest
  )[];

type BindingPathStart = { type: 'start' };
type BindingPathObj = { type: 'obj' };
type BindingPathObjKey = { type: 'key', key: string | number };
type BindingPathObjRest = { type: 'rest', exclude: string[] };
type BindingPathArray = { type: 'array' };
type BindingPathArrayIndex = { type: 'key', key: string | number };
type BindingPathArrayRest = { type: 'rest', start: string | number };

export type BindingPathRest = BindingPathObjRest | BindingPathArrayRest;


export default function <T extends PossibleEntityTypes>(
  id: PatternLike | LVal | TSParameterProperty,
  scope: ENREContext['scope'],
  overridePrefix: BindingPath | undefined,
  onRecord: (
    name: string,
    location: ENRELocation,
    scope: ENREContext['scope'],
  ) => T,
  onRecordConstructorField?: (
    name: string,
    location: ENRELocation,
    scope: ENREScope,
    TSVisibility: TSVisibility,
  ) => ENREEntityField,
): BindingRepr<T>[] {
  return recursiveTraverse(id, overridePrefix ?? [{type: 'start'}]).map(item => {
    /**
     * If the AST node represents a TypeScript constructor parameter field,
     * a field entity (of the class entity) and a field entity with the same name & location
     * (of the constructor entity) are created, and only the parameter entity is returned.
     */
    if (id.type === 'TSParameterProperty') {
      onRecordConstructorField ? onRecordConstructorField(
        item.name,
        item.location,
        scope,
        id.accessibility!
      ) : undefined;
    }

    return {
      path: item.path,
      entity: onRecord(
        item.name,
        item.location,
        scope,
      )
    };
  });
}

function recursiveTraverse(
  id: PatternLike | LVal | TSParameterProperty,
  prefix: BindingPath,
): {
  path: BindingPath,
  name: string,
  location: ENRELocation,
}[] {
  // TODO: Snapshot test this function based on test cases in /docs/entity/variable.md

  const result = [];

  switch (id.type) {
    case 'Identifier': {
      const _prefix = [...prefix];
      if (!(
        // Do not add identifier name to path if it is not a destructuring pattern
        (prefix.length === 1 && prefix[0].type === 'start')
        // Do not add identifier name if it is an array pattern
        || prefix.at(-2)?.type === 'array'
        // Do not add identifier name if it is an object value
        || prefix.at(-2)?.type === 'obj'
      )) {
        _prefix.push({type: 'key', key: id.name});
      }

      result.push({
        path: _prefix,
        name: id.name,
        location: toENRELocation(id.loc)
      });
      break;
    }

    case 'RestElement':
      for (const item of recursiveTraverse(id.argument, prefix)) {
        result.push({
          ...item,
          path: '<rest>',
        });
      }
      break;

    case 'AssignmentPattern': {
      for (const item of recursiveTraverse(id.left, prefix)) {
        const _pathTmp = item.path.split('.');
        _pathTmp.splice(prefix.split('.').length, 1);
        result.push({
          ...item,
          path: _pathTmp.join('.'),
        });
      }
      // TODO: resolve and save AssignmentPattern.right
      break;
    }

    case 'ObjectPattern': {
      const usedProps: string[] = [];
      for (const property of id.properties) {
        if (property.type === 'RestElement') {
          // Its argument can ONLY be Identifier
          const _prefix = [...prefix];
          _prefix.push(...[{type: 'obj'}, {type: 'rest', exclude: usedProps}]);
          for (const item of recursiveTraverse(property.argument, _prefix)) {
            result.push(item);
          }
        } else {
          // TODO: Unified get key

          const _prefix = [...prefix, {type: 'obj'}];
          if (property.key.type === 'Identifier' &&
            ((property.value.type === 'Identifier' && property.key.name !== property.value.name) ||
              property.value.type !== 'Identifier')) {
            usedProps.push(property.key.name ?? property.key.value);
            _prefix.push({type: 'key', key: property.key.name});
          } else if (property.key.type === 'NumericLiteral') {
            usedProps.push(property.key.value);
            _prefix.push({type: 'key', key: property.key.value});
          } else if (property.key.type === 'StringLiteral') {
            usedProps.push(property.key.value);
            _prefix.push({type: 'key', key: property.key.value});
          }
          // property.type === 'ObjectProperty'
          for (const item of recursiveTraverse(property.value, _prefix)) {
            result.push(item);
          }
        }
      }
      break;
    }

    case 'ArrayPattern':
      for (const element of id.elements) {
        if (element === null) {
          result.push(undefined);
        } else if (element.type === 'RestElement') {
          // Its argument can STILL be a pattern
          // Rest operator can be used with comma elision, elements before the rest operator are not put into the rest variable
          const _prefix = [...prefix];
          _prefix.push(...[{type: 'array'}, {type: 'rest', start: result.length}] as const);
          for (const item of recursiveTraverse(element.argument, _prefix)) {
            result.push({
              ...item,
              path: item.path,
            });
          }
        } else {
          // element.type === 'PatternLike'
          const _prefix = [...prefix];
          _prefix.push(...[{type: 'array'}, {type: 'key', key: result.length}] as const);
          for (const item of recursiveTraverse(element, _prefix)) {
            result.push(item);
          }
        }
      }
      break;

    case 'TSParameterProperty':
      if (id.parameter.type === 'Identifier') {
        result.push(...recursiveTraverse(id.parameter, prefix));
      }
      // id.parameter.type === 'AssignmentPattern'
      else {
        if (id.parameter.left.type === 'Identifier') {
          result.push(...recursiveTraverse(id.parameter.left, prefix));
        } else if (['ArrayPattern', 'ObjectPattern'].includes(id.parameter.left.type)) {
          // Indeed invalid syntax
          result.push(recursiveTraverse(id.parameter.left, prefix));
        } else {
          // console.warn(`Unhandled BindingPattern type ${id.parameter.left.type}`);
        }
      }
      break;
  }

  // Remove `undefined` (placeholder for array destructuring with comma elision)
  return result.filter(item => item !== undefined) as ReturnType<typeof recursiveTraverse>;
}
