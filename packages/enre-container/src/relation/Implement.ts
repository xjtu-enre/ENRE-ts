import {ENREEntityClass, ENREEntityInterface, rGraph} from '@enre/container';
import {ENRERelationBase, recordRelationBase} from './Base';

export interface ENRERelationImplement extends ENRERelationBase {
  readonly type: 'implement',
  from: ENREEntityClass,
  to: ENREEntityClass | ENREEntityInterface,
}

export const recordRelationImplement = (
  from: ENREEntityClass,
  to: ENREEntityClass | ENREEntityInterface,
  location: string,
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