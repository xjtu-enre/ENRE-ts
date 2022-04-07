import {ENREEntityBase, recordEntityBase} from './eBase';
import {ENREEntityCollectionAll, ENRELocation} from './index';
import global from '../../utils/global';
import {ENREName} from '../../utils/nameHelper';

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

  global.eContainer.add(_obj);

  return _obj;
};
