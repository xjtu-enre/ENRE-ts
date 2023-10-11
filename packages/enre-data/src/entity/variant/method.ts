import {ENRELocation} from '@enre/location';
import ENREName from '@enre/naming';
import {addAbilityBase, ENREEntityAbilityBase} from '../ability/base';
import {addAbilityClassMember, ENREEntityAbilityClassMember} from '../ability/class-member';
import {ENREEntityClass} from './class';
import {addAbilityCallable, ENREEntityAbilityCallable} from '../ability/callable';
import {addAbilityAbstractable, ENREEntityAbilityAbstractable} from '../ability/abstractable';
import {methodKind} from '@enre/shared';
import {recordEntity} from '../../utils/wrapper';

export interface ENREEntityMethod extends ENREEntityAbilityBase, ENREEntityAbilityClassMember, ENREEntityAbilityCallable, ENREEntityAbilityAbstractable {
  type: 'method',
  kind: methodKind,
}

export const createEntityMethod = (
  name: ENREName<any>,
  location: ENRELocation,
  parent: ENREEntityClass,
  {
    kind = 'method' as const,
    isStatic = false,
    isPrivate = false,
    isAsync = false,
    isGenerator = false,
    isAbstract = false,
    TSVisibility = undefined,
  }: Partial<Pick<ENREEntityMethod, 'kind' | 'isStatic' | 'isPrivate' | 'isAsync' | 'isGenerator' | 'isAbstract' | 'TSVisibility'>>,
): ENREEntityMethod => {
  return {
    ...addAbilityBase(name, location, parent),

    ...addAbilityClassMember(isStatic!, isPrivate!, TSVisibility),

    ...addAbilityCallable(isAsync!, isGenerator!),

    ...addAbilityAbstractable(isAbstract!),

    type: 'method',

    kind,
  };
};

export const recordEntityMethod = recordEntity(createEntityMethod);
