import {ENRELocation} from '@enre/location';
import {ENREName} from '@enre/naming';
import eGraph from '../../container/e';
import {ENREEntityAbilityBase, recordEntityBase} from '../ability/base';
import {ENREEntityCollectionAll} from '../collections';
import {ENREEntityAbilityMultiDeclarable} from '../ability/multideclarable';

export interface ENREEntityInterface extends ENREEntityAbilityBase, ENREEntityAbilityMultiDeclarable {
  readonly type: 'interface';
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
