import {ENRELocation} from '@enre/location';
import {ENREName} from '@enre/naming';
import eGraph from '../../container/e';
import {ENREEntityAbilityBase, recordEntityBase} from '../ability/base';
import {ENREEntityAbilityClassMember} from '../ability/class-member';
import {ENREEntityClass} from './class';
import {ENREEntityAbilityFunctionLike} from '../ability/function-like';
import {ENREEntityAbilityAbstractable} from '../ability/abstractable';

export interface ENREEntityMethod extends ENREEntityAbilityBase<ENREEntityClass>, ENREEntityAbilityClassMember, ENREEntityAbilityFunctionLike, ENREEntityAbilityAbstractable {
  readonly type: 'method';
  readonly kind: 'constructor' | 'method' | 'get' | 'set';
}

export const recordEntityMethod = (
  name: ENREName,
  location: ENRELocation,
  parent: ENREEntityClass,
  {
    kind = 'method' as const,
    isStatic = false,
    isPrivate = false,
    isImplicit = false,
    isAsync = false,
    isGenerator = false,
    isAbstract = false,
    TSModifier = undefined,
  }: Partial<Pick<ENREEntityMethod, 'kind' | 'isStatic' | 'isPrivate' | 'isImplicit' | 'isAsync' | 'isGenerator' | 'isAbstract' | 'TSModifier'>>,
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
