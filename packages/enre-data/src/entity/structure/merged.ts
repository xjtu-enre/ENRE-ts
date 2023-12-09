import {ENRELocation} from '@enre-ts/location';
import {ENREEntityAbilityBase} from '../ability/base';
import ENREName from '@enre-ts/naming';

export interface ENREEntityMerged {
  type: 'merged';
  name: ENREName<any>;
  declarations: Map<ENRELocation, ENREEntityAbilityBase>;
}

export const convertToMergedEntity = (first: ENREEntityAbilityBase): ENREEntityMerged => {
  const declarations: Map<ENRELocation, ENREEntityAbilityBase> = new Map();

  declarations.set(first.location, first);

  return {
    name: first.name,

    type: 'merged',

    declarations,
  };
};
