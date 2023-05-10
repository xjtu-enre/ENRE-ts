import {ENRELocation} from '@enre/location';
import {ENREName} from '@enre/naming';
import eGraph from '../../container/e';
import {ENREEntityAbilityBase, recordEntityBase} from '../ability/base';
import {ENREEntityClass} from './class';
import {ENREEntityFunction} from './function';
import {ENREEntityInterface} from './interface';
import {ENREEntityMethod} from './method';

// TODO: Add TypeAlias
type TypeParameterParentType = ENREEntityClass | ENREEntityInterface | ENREEntityFunction | ENREEntityMethod;

export interface ENREEntityTypeParameter extends ENREEntityAbilityBase<TypeParameterParentType> {
  readonly type: 'type parameter';
  readonly isConst: boolean;
}

export const recordEntityTypeParameter = (
  name: ENREName,
  location: ENRELocation,
  parent: TypeParameterParentType,
  {
    isConst = false,
  },
): ENREEntityTypeParameter => {
  const _base = recordEntityBase<TypeParameterParentType>(name, location, parent);

  const _obj = {
    ..._base,

    get type() {
      return 'type parameter' as const;
    },

    get isConst() {
      return isConst;
    }
  };

  eGraph.add(_obj);

  return _obj;
};
