import {ENREEntityCollectionAll} from '../../entity/collections';
import {ENREEntityFile} from '../../entity/variant/file';
import {ENRELocation} from '@enre/location';
import rGraph from '../../container/r';
import {ENRERelationAbilityBase, recordRelationBase} from '../ability/base';
import {ENRERelationAbilityExplicitSymbolRole} from '../ability/explicit-symbol-role';
import {ENRERelationAliasOf} from './aliasof';
import {ENRERelationAbilitySourceRange} from '../ability/source-range';

export interface ENRERelationImport extends ENRERelationAbilityBase, ENRERelationAbilityExplicitSymbolRole, ENRERelationAbilitySourceRange {
  readonly type: 'import',
  alias?: ENRERelationAliasOf<ENRERelationImport>,
}

export const recordRelationImport = (
  from: ENREEntityFile,
  to: ENREEntityCollectionAll,
  location: ENRELocation,
  {
    kind = 'any',
    sourceRange,
  }: Partial<Pick<ENRERelationImport, 'kind'>> & Pick<ENRERelationImport, 'sourceRange'>
): ENRERelationImport => {
  const _base = recordRelationBase(from, to, location);
  let alias: ENRERelationAliasOf<ENRERelationImport>;

  const _obj = {
    ..._base,

    get type() {
      return 'import' as const;
    },

    get kind() {
      return kind;
    },

    set alias(value) {
      alias = value;
    },

    get alias() {
      return alias;
    },

    get sourceRange() {
      return sourceRange;
    },
  };

  rGraph.add(_obj);

  return _obj;
};
