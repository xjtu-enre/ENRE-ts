import {ENRELocation} from '@enre/location';
import {ENREName} from '@enre/naming';
import eGraph from '../container/e';
import {ENREEntityBase, recordEntityBase} from './Base';
import {ENREEntityCollectionAll} from './collections';

export interface ENREEntityInterface extends ENREEntityBase {
  readonly type: 'interface';
  readonly declarations: Array<ENRELocation>;
}

export const recordEntityInterface = (
  name: ENREName,
  location: ENRELocation,
  parent: ENREEntityCollectionAll,
): ENREEntityInterface => {
  const _base = recordEntityBase(name, location, parent);
  const _declarations: Array<ENRELocation> = [];

  const _obj = {
    ..._base,

    get type() {
      return 'interface' as const;
    },

    get declarations() {
      return _declarations;
    }
  };

  eGraph.add(_obj);

  return _obj;
};
