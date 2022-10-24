import {ENRELocation} from '@enre/location';
import rGraph from '../../container/r';
import {ENRERelationAbilityBase, recordRelationBase} from '../ability/base';
import {ENREEntityCollectionInFile} from '../../entity/collections';

export interface ENRERelationImplement extends ENRERelationAbilityBase {
  readonly type: 'implement',
}

export const recordRelationImplement = (
  from: ENREEntityCollectionInFile,
  to: ENREEntityCollectionInFile,
  location: ENRELocation,
) => {
  const _base = recordRelationBase(from, to, location);

  const _obj = {
    ..._base,

    get type() {
      return 'implement' as const;
    },
  } as ENRERelationImplement;

  rGraph.add(_obj);

  return _obj;
};
