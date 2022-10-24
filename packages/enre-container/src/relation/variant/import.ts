import {ENREEntityCollectionAll} from '../../entity/collections';
import {ENREEntityFile} from '../../entity/variant/file';
import {ENRELocation} from '@enre/location';
import rGraph from '../../container/r';
import {ENRERelationAbilityBase, recordRelationBase} from '../ability/base';
import {ENRERelationAbilityExplicitSymbolRole} from '../ability/explicit-symbol-role';

export interface ENRERelationImport extends ENRERelationAbilityBase, ENRERelationAbilityExplicitSymbolRole {
  readonly type: 'import',
  readonly alias?: string,
}

export const recordRelationImport = (
  from: ENREEntityFile,
  to: ENREEntityCollectionAll,
  location: ENRELocation,
  {
    kind = 'value',
    alias,
  }: Partial<Pick<ENRERelationImport, 'kind' | 'alias'>> = {kind: 'value'}
) => {
  const _base = recordRelationBase(from, to, location);

  const _obj = {
    ..._base,

    get type() {
      return 'import' as const;
    },

    get kind() {
      return kind;
    },

    get alias() {
      return alias;
    },
  } as ENRERelationImport;

  rGraph.add(_obj);

  return _obj;
};
