import {ENRELocation} from '@enre/location';
import {ENREName} from '@enre/naming';
import eGraph from '../../container/e';
import {ENREEntityAbilityBase, recordEntityBase} from '../ability/base';
import {ENREEntityCollectionAll} from '../collections';

export interface ENREEntityProperty extends ENREEntityAbilityBase {
  readonly type: 'property';
  // readonly signature: 'property' | 'call' | 'constructor' | 'method';
}

export const recordEntityProperty = (
  name: ENREName,
  location: ENRELocation,
  parent: ENREEntityCollectionAll,
  // {
  //   signature = 'property',
  // }: Partial<Pick<ENREEntityProperty, 'signature'>>
): ENREEntityProperty => {
  const _base = recordEntityBase(name, location, parent);

  const _obj = {
    ..._base,

    get type() {
      return 'property' as const;
    },

    // get signature() {
    //   return signature;
    // },
  };

  eGraph.add(_obj);

  return _obj;
};
