import {ENRELocation} from '@enre/location';
import {ENREName} from '@enre/naming';
import eGraph from '../../container/e';
import {ENREEntityAbilityBase, recordEntityBase} from '../ability/base';
import {ENREEntityAbilityClassMember} from '../ability/class-member';
import {ENREEntityClass} from './class';
import {ENREEntityAbilityAbstractable} from '../ability/abstractable';

export interface ENREEntityField extends ENREEntityAbilityBase<ENREEntityClass>, ENREEntityAbilityClassMember, ENREEntityAbilityAbstractable {
  readonly type: 'field';
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
