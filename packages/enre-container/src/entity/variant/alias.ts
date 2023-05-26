import {ENRELocation} from '@enre/location';
import {ENREName} from '@enre/naming';
import eGraph from '../../container/e';
import {ENREEntityAbilityBase, recordEntityBase} from '../ability/base';
import {ENREEntityCollectionAll} from '../collections';
import {ENRERelationAliasOf} from '../../relation/variant/aliasof';
import {ENRERelationImport} from '../../relation/variant/import';
import {ENRERelationExport} from '../../relation/variant/export';

type Aliasable = ENRERelationImport | ENRERelationExport

export interface ENREEntityAlias<T extends Aliasable = Aliasable> extends ENREEntityAbilityBase {
  readonly type: 'alias';
  /**
   * Link to the AliasOf relation that uses this alias entity.
   *
   * The binding is automatically performed (in the relation side).
   */
  aliasOf: ENRERelationAliasOf<T>;
}

export const recordEntityAlias = <T extends Aliasable>(
  name: ENREName,
  location: ENRELocation,
  parent: ENREEntityCollectionAll,
): ENREEntityAlias<T> => {
  const _base = recordEntityBase(name, location, parent);
  let aliasOf: ENRERelationAliasOf<T>;

  const _obj = {
    ..._base,

    get type() {
      return 'alias' as const;
    },

    set aliasOf(value) {
      aliasOf = value;
    },

    get aliasOf() {
      return aliasOf;
    }
  };

  eGraph.add(_obj);

  return _obj;
};
