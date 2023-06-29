import {ENRELocation} from '@enre/location';
import ENREName from '@enre/naming';
import {addAbilityBase, ENREEntityAbilityBase} from '../ability/base';
import {addAbilityClassMember, ENREEntityAbilityClassMember} from '../ability/class-member';
import {ENREEntityClass} from './class';
import {addAbilityAbstractable, ENREEntityAbilityAbstractable} from '../ability/abstractable';
import {recordEntity} from '../../misc/wrapper';

export interface ENREEntityField extends ENREEntityAbilityBase, ENREEntityAbilityClassMember, ENREEntityAbilityAbstractable {
  type: 'field';
}

export const createEntityField = (
  name: ENREName<any>,
  location: ENRELocation,
  parent: ENREEntityClass,
  {
    isStatic = false,
    isPrivate = false,
    isAbstract = false,
    TSVisibility = undefined,
  }: Partial<Pick<ENREEntityField, 'isStatic' | 'isPrivate' | 'isAbstract' | 'TSVisibility'>>
): ENREEntityField => {
  return {
    ...addAbilityBase(name, location, parent),

    ...addAbilityClassMember(isStatic!, isPrivate!, TSVisibility),

    ...addAbilityAbstractable(isAbstract!),

    type: 'field',
  };
};

export const recordEntityField = recordEntity(createEntityField);
