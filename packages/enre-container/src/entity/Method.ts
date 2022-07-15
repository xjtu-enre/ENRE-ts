import {ENRELocation} from '@enre/location';
import {ENREName} from '@enre/naming';
import eGraph from '../container/eContainer';
import {ENREEntityBase, recordEntityBase} from './Base';
import {ENREEntityCollectionAll} from './collections';

export declare type ENREEntityMethodKind = 'method' | 'get' | 'set';

export interface ENREEntityMethod extends ENREEntityBase {
  readonly type: 'method';
  readonly kind: ENREEntityMethodKind;
  readonly isStatic: boolean;
  readonly isPrivate: boolean;
  readonly isImplicit: boolean;
  readonly isAsync: boolean;
  readonly isGenerator: boolean;
}

declare type ENREEntityMethodProps = Partial<Exclude<ENREEntityMethod, 'type'>>;

export const recordEntityMethod = (
  name: ENREName,
  location: ENRELocation,
  parent: ENREEntityCollectionAll,
  props?: ENREEntityMethodProps,
): ENREEntityMethod => {
  const _base = recordEntityBase(name, location, parent);

  const _obj = {
    ..._base,

    get type() {
      return 'method' as const;
    },

    get kind() {
      return props?.kind ?? 'method';
    },

    get isStatic() {
      return props?.isStatic ?? false;
    },

    get isPrivate() {
      return props?.isPrivate ?? false;
    },

    get isImplicit() {
      return props?.isImplicit ?? false;
    },

    get isAsync() {
      return props?.isAsync ?? false;
    },

    get isGenerator() {
      return props?.isGenerator ?? false;
    },
  };

  eGraph.add(_obj);

  return _obj;
};
