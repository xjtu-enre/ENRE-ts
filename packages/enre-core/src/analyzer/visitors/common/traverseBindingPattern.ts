import {LVal, PatternLike, TSParameterProperty} from '@babel/types';
import {ENREEntityField, ENREEntityParameter, ENREEntityVariable} from '@enre/data';
import {ENRELocation, toENRELocation} from '@enre/location';
import {ENREContext} from '../../context';
import {TSVisibility} from '@enre/shared';
import {ENREScope} from '../../context/scope';

type PossibleEntityTypes = ENREEntityVariable | ENREEntityParameter;

type BindingRepr<T extends PossibleEntityTypes> = { path: string, entity: T | ENREEntityField };

export default function <T extends PossibleEntityTypes>(
  id: PatternLike | LVal | TSParameterProperty,
  scope: ENREContext['scope'],
  overridePrefix: string | undefined,
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
  return recursiveTraverse(id, overridePrefix ?? '<start>').map(item => {
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
  prefix: string,
): {
  path: string,
  name: string,
  location: ENRELocation,
}[] {
  // TODO: Snapshot test this function based on test cases in /docs/entity/variable.md

  const result = [];

  switch (id.type) {
    case 'Identifier': {
      let _prefix = prefix;
      if (
        // Do not add identifier name to path if it is not a destructuring pattern
        prefix !== '<start>' &&
        // @ts-ignore Do not add identifier name to destructuring path if it is in an array pattern
        isNaN(prefix.split('.').at(-1))
      ) {
        _prefix += `.${id.name}`;
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

    case 'ObjectPattern':
      for (const property of id.properties) {
        if (property.type === 'RestElement') {
          // Its argument can ONLY be Identifier
          for (const item of recursiveTraverse(property.argument, `${prefix}.<obj>.<rest>`)) {
            result.push({
              ...item,
              path: item.path.slice(0, item.path.lastIndexOf('.')),
            });
          }
        } else {
          let _prefix = `${prefix}.<obj>`;
          if (property.key.type === 'Identifier' &&
            ((property.value.type === 'Identifier' && property.key.name !== property.value.name) ||
              property.value.type !== 'Identifier')) {
            _prefix += `.${property.key.name}`;
          }
          // @ts-ignore property.type === 'ObjectProperty'
          for (const item of recursiveTraverse(property.value, _prefix)) {
            result.push(item);
          }
        }
      }
      break;

    case 'ArrayPattern':
      for (const element of id.elements) {
        if (element === null) {
          result.push(undefined);
        } else if (element.type === 'RestElement') {
          // Its argument can STILL be a pattern
          // Rest operator can be used with comma elision, elements before the rest operator are not put into the rest variable
          for (const item of recursiveTraverse(element.argument, `${prefix}.<array>.${result.length}:`)) {
            result.push({
              ...item,
              // Trim identifier: <start>.<array>.1:.r (where r is the rest variable's name)
              // Do not trim: <start>.<array>.1:.<obj>.(...) (that is, the array rest variable is destructured)
              path: item.path.split('.').at(-2)?.endsWith(':') ? item.path.slice(0, item.path.lastIndexOf('.')) : item.path,
            });
          }
        } else {
          // element.type === 'PatternLike'
          for (const item of recursiveTraverse(element, `${prefix}.<array>.${result.length}`)) {
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
