import {ENREEntityCollectionAll} from '../../entity/collections';
import {ENRELocation} from '@enre/location';
import rGraph from '../../container/r';
import {ENRERelationAbilityBase, recordRelationBase} from '../ability/base';
import {ENREEntityAlias, ENRERelationExport, ENRERelationImport} from '@enre/container';

type Aliasable = ENRERelationImport | ENRERelationExport

export interface ENRERelationAliasOf<T extends Aliasable = Aliasable> extends ENRERelationAbilityBase {
  readonly type: 'aliasof',
  /**
   * The correlated import/export relation that produces this alias relation.
   *
   * Usually it is not needed to manually set this, while adding this relation to export/import relation,
   * it will set this binding at that time.
   */
  binding: T;
}

export const recordRelationAliasOf = <T extends Aliasable>(
  from: ENREEntityAlias<T>,
  to: ENREEntityCollectionAll,
  location: ENRELocation,
): ENRERelationAliasOf<T> => {
  const _base = recordRelationBase(from, to, location);
  let binding: T;

  const _obj = {
    ..._base,

    get type() {
      return 'aliasof' as const;
    },

    set binding(value: T) {
      binding = value;
    },

    get binding() {
      return binding;
    }
  };

  from.aliasOf = _obj;

  rGraph.add(_obj);

  return _obj;
};
