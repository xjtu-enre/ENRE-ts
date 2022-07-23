import {ENRELocation} from '@enre/location';
import {ENREName} from '@enre/naming';
import eGraph from '../container/eContainer';
import {ENREEntityBase, recordEntityBase} from './Base';
import {ENREEntityCollectionAll} from './collections';

export interface ENREEntityInterface extends ENREEntityBase {
  readonly type: 'interface';
}

export const recordEntityInterface = (
  name: ENREName,
  location: ENRELocation,
  parent: ENREEntityCollectionAll,
): ENREEntityInterface => {
  const _base = recordEntityBase(name, location, parent);

  const _obj = {
    ..._base,

    get type() {
      return 'interface' as const;
    },
  };

  eGraph.add(_obj);

  return _obj;
};
