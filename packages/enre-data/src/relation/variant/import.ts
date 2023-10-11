import {ENREEntityCollectionAll} from '../../entity/collections';
import {ENRELocation} from '@enre/location';
import {addAbilityBase, ENRERelationAbilityBase} from '../ability/base';
import {ENRERelationAbilityExplicitSymbolRole} from '../ability/explicit-symbol-role';
import {ENRERelationAbilitySourceRange} from '../ability/source-range';
import {ENREEntityAlias} from '../../entity/variant/alias';
import {recordRelation} from '../../utils/wrapper';

export interface ENRERelationImport extends ENRERelationAbilityBase, ENRERelationAbilityExplicitSymbolRole, ENRERelationAbilitySourceRange {
  type: 'import',
  /**
   * @release This property is released to an aliasof relation.
   */
  alias?: ENREEntityAlias<ENRERelationImport>,
}

export const createRelationImport = (
  from: ENREEntityCollectionAll,
  to: ENREEntityCollectionAll,
  location: ENRELocation,
  {
    kind = 'any',
    sourceRange,
    alias = undefined,
  }: Pick<ENRERelationImport, 'kind' | 'sourceRange' | 'alias'>
): ENRERelationImport => {
  const rel = {
    ...addAbilityBase(from, to, location),

    type: 'import',

    kind,

    alias,

    sourceRange,
  };

  if (alias) {
    alias.ofRelation = rel as ENRERelationImport;
  }

  return rel as ENRERelationImport;
};

export const recordRelationImport = recordRelation(createRelationImport);
