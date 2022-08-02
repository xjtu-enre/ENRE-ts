import {ENRELocation} from '@enre/location';
import {ENREName} from '@enre/naming';
import eGraph from '../container/e';
import {ENREEntityBase, recordEntityBase} from './Base';
import {ENREEntityClass, TSModifier} from './Class';

export interface ENREEntityField extends ENREEntityBase<ENREEntityClass> {
  readonly type: 'field';
  readonly isStatic: boolean;
  readonly isPrivate: boolean;
  /**
   * `Implicit` indicates this field is created through `this.*`,
   * which might not be presented at up-front class fields.
   */
  readonly isImplicit: boolean;
  readonly isAbstract: boolean;
  readonly TSModifier?: TSModifier;
}

export const recordEntityField = (
  name: ENREName,
  location: ENRELocation,
  parent: ENREEntityClass,
  {
    isStatic = false,
    isPrivate = false,
    isImplicit = false,
    isAbstract = false,
    TSModifier = undefined,
  }: Partial<Pick<ENREEntityField, 'isStatic' | 'isPrivate' | 'isImplicit' | 'isAbstract' | 'TSModifier'>>
): ENREEntityField => {
  const _base = recordEntityBase<ENREEntityClass>(name, location, parent);

  const _obj = {
    ..._base,

    get type() {
      return 'field' as const;
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

    get isAbstract() {
      return isAbstract;
    },

    get TSModifier() {
      return TSModifier;
    },
  };

  eGraph.add(_obj);

  return _obj;
};
