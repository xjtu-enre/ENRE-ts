import {TSVisibility} from '@enre/shared';

export interface ENREEntityAbilityClassMember {
  isStatic: boolean;
  // ECMAScript native private feature
  isPrivate: boolean;
  TSVisibility?: TSVisibility;
}

export const addAbilityClassMember = (
  isStatic: boolean,
  isPrivate: boolean,
  TSVisibility?: TSVisibility,
) => {
  return {
    isStatic,

    isPrivate,

    TSVisibility,
  };
};
