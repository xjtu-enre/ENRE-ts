import {ENREEntityClass, ENREEntityInterface, rGraph} from '@enre/container';
import {ENRERelationBase, recordRelationBase} from './Base';

export interface ENRERelationExtend<T extends ENREEntityClass | ENREEntityInterface> extends ENRERelationBase {
  readonly type: 'extend',
  readonly from: T,
  readonly to: T extends ENREEntityClass ? ENREEntityClass : ENREEntityClass | ENREEntityInterface,
}

export const recordRelationExtend = <T extends ENREEntityClass | ENREEntityInterface>(
  from: T,
  to: ENREEntityClass | ENREEntityInterface,
  location: string,
) => {
  const _base = recordRelationBase(from, to, location);

  const _obj = {
    ..._base,

    get type() {
      return 'extend' as const;
    },
  } as ENRERelationExtend<T>;

  rGraph.add(_obj);

  return _obj;
};
