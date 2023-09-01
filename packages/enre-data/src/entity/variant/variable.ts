import {ENRELocation} from '@enre/location';
import ENREName from '@enre/naming';
import {addAbilityBase, ENREEntityAbilityBase} from '../ability/base';
import {ENREEntityCollectionAll} from '../collections';
import {variableKind} from '@enre/shared';
import {id, recordEntity} from '../../utils/wrapper';

export interface ENREEntityVariable extends ENREEntityAbilityBase {
  type: 'variable';
  kind: variableKind;
}

export const createEntityVariable = (
  name: ENREName<any>,
  location: ENRELocation,
  parent: id<ENREEntityCollectionAll>,
  {kind}: Pick<ENREEntityVariable, 'kind'>
): ENREEntityVariable => {
  return {
    ...addAbilityBase(name, location, parent),

    type: 'variable',

    kind,
  };
};

export const recordEntityVariable = recordEntity(createEntityVariable);
