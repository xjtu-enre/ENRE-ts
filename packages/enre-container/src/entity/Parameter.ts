import {ENRELocation} from '@enre/location';
import {ENREName} from '@enre/naming';
import eGraph from '../container/eContainer';
import {ENREEntityBase, recordEntityBase} from './Base';
import {ENREEntityCollectionAll} from './collections';

// TODO: After adding virtual nodes (if-else, try-catch), correctly type this generic
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
