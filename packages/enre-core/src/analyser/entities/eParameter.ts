import {ENRELocation} from '@enre/location';
import {ENREName} from '@enre/naming';
import eGraph from './container';
import {ENREEntityBase, recordEntityBase} from './eBase';
import {ENREEntityCollectionAll} from './index';

export interface ENREEntityParameter extends ENREEntityBase {
  readonly type: 'parameter';
}

export const recordEntityParameter = (
  name: ENREName,
  location: ENRELocation,
  parent: ENREEntityCollectionAll,
): ENREEntityParameter => {
  const _base = recordEntityBase(name, location, parent);

  const _obj = {
    ..._base,

    get type() {
      return 'parameter' as const;
    },
  };

  eGraph.add(_obj);

  return _obj;
};
