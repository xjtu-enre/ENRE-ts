import {ENRELocation} from '@enre/location';
import {ENREName} from '@enre/naming';
import eGraph from '../../container/e';
import {ENREEntityAbilityBase, recordEntityBase} from '../ability/base';
import {ENREEntityCollectionAll} from '../collections';
import {ENREEntityAbilityMultiDeclarable} from '../ability/multideclarable';

export interface ENREEntityNamespace extends ENREEntityAbilityBase, ENREEntityAbilityMultiDeclarable {
  readonly type: 'namespace';
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
