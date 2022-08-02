import {ENRELocation} from '@enre/location';
import {ENREName} from '@enre/naming';
import eGraph from '../container/e';
import {ENREEntityBase, recordEntityBase} from './Base';
import {ENREEntityClass} from './Class';
import {ENREEntityFunction} from './Function';
import {ENREEntityInterface} from './Interface';
import {ENREEntityMethod} from './Method';

// TODO: Add TypeAlias
type TypeParameterParentType = ENREEntityClass | ENREEntityInterface | ENREEntityFunction | ENREEntityMethod;

export interface ENREEntityTypeParameter extends ENREEntityBase<TypeParameterParentType> {
  readonly type: 'type parameter';
}

export const recordEntityTypeParameter = (
  name: ENREName,
  location: ENRELocation,
  parent: TypeParameterParentType,
): ENREEntityTypeParameter => {
  const _base = recordEntityBase<TypeParameterParentType>(name, location, parent);

  const _obj = {
    ..._base,

    get type() {
      return 'type parameter' as const;
    },
  };

  eGraph.add(_obj);

  return _obj;
};
