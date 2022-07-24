import {ENRELocation} from '@enre/location';
import {ENREName} from '@enre/naming';
import eGraph from '../container/eContainer';
import {ENREEntityBase, recordEntityBase} from './Base';
import {ENREEntityClass} from './Class';

export interface ENREEntityMethod extends ENREEntityBase<ENREEntityClass> {
  readonly type: 'method';
  readonly kind: 'method' | 'get' | 'set';
  readonly isStatic: boolean;
  readonly isPrivate: boolean;
  readonly isImplicit: boolean;
  readonly isAsync: boolean;
  readonly isGenerator: boolean;
  readonly TSModifier?: 'public' | 'protected' | 'private';
}

export const recordEntityMethod = (
  name: ENREName,
  location: ENRELocation,
  parent: ENREEntityClass,
  {
    kind = 'method',
    isStatic = false,
    isPrivate = false,
    isImplicit = false,
    isAsync = false,
    isGenerator = false,
    TSModifier = undefined,
  }: Partial<Pick<ENREEntityMethod, 'kind' | 'isStatic' | 'isPrivate' | 'isImplicit' | 'isAsync' | 'isGenerator' | 'TSModifier'>>
): ENREEntityMethod => {
  const _base = recordEntityBase<ENREEntityClass>(name, location, parent);

  const _obj = {
    ..._base,

    get type() {
      return 'method' as const;
    },

    get kind() {
      return kind;
    },

    get isStatic() {
      return isStatic;
    },

    get isPrivate() {
      return isPrivate;
    },

    get isImplicit() {
      return isImplicit;
    },

    get isAsync() {
      return isAsync;
    },

    get isGenerator() {
      return isGenerator;
    },

    get TSModifier() {
      return TSModifier;
    },
  };

  eGraph.add(_obj);

  return _obj;
};
