import {ENRELocation} from '@enre/location';
import {ENREName} from '@enre/naming';
import eGraph from '../container/eContainer';
import {ENREEntityBase, recordEntityBase} from './Base';
import {ENREEntityClass} from './Class';
import {ENREEntityFunction} from './Function';
import {ENREEntityInterface} from './Interface';
import {ENREEntityMethod} from './Method';

// TODO: Add TypeAlias
declare type ParentType = ENREEntityClass | ENREEntityInterface | ENREEntityFunction | ENREEntityMethod;

export interface ENREEntityTypeParameter extends ENREEntityBase<ParentType> {
  readonly type: 'type parameter';
}

export const recordEntityTypeParameter = (
  name: ENREName,
  location: ENRELocation,
  parent: ParentType,
): ENREEntityTypeParameter => {
  const _base = recordEntityBase<ParentType>(name, location, parent);

  const _obj = {
    ..._base,

    get type() {
      return 'type parameter' as const;
    },
  };

  eGraph.add(_obj);

  return _obj;
};
