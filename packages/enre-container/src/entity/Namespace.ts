import {ENRELocation} from '@enre/location';
import {ENREName} from '@enre/naming';
import eGraph from '../container/e';
import {ENREEntityBase, recordEntityBase} from './Base';
import {ENREEntityCollectionAll} from './collections';

export interface ENREEntityNamespace extends ENREEntityBase {
  readonly type: 'namespace';
  readonly declarations: Array<ENRELocation>;
}

export const recordEntityNamespace = (
  name: ENREName,
  location: ENRELocation,
  parent: ENREEntityCollectionAll,
): ENREEntityNamespace => {
  const _base = recordEntityBase(name, location, parent);
  const _declarations: Array<ENRELocation> = [];

  const _obj = {
    ..._base,

    get type() {
      return 'namespace' as const;
    },

    get declarations() {
      return _declarations;
    }
  };

  eGraph.add(_obj);

  return _obj;
};
