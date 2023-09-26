import {ENREEntityCollectionAll} from '../../entity/collections';
import {ENREEntityFile} from '../../entity/structure/file';
import {ENRELocation} from '@enre/location';
import {addAbilityBase, ENRERelationAbilityBase} from '../ability/base';
import {ENRERelationAbilityExplicitSymbolRole} from '../ability/explicit-symbol-role';
import {ENRERelationAbilitySourceRange} from '../ability/source-range';
import {ENREEntityAlias} from '../../entity/variant/alias';
import {id, recordRelation} from '../../utils/wrapper';
import {ENREEntityNamespace} from '../../entity/variant/namespace';

export interface ENRERelationExport extends ENRERelationAbilityBase, ENRERelationAbilityExplicitSymbolRole, Partial<ENRERelationAbilitySourceRange> {
  type: 'export',
  isDefault: boolean,
  /**
   * To distinguish the following two 'file -export-> file' relations:
   *
   * * `export * from 'mod'`, where isAll=true
   * * `export {} from 'mod'`, where isAll=false
   *
   * Both two declarations enable side effects, and the type of from/to entities are all 'file',
   * however, the first one exports all symbols from mod, yet the second one does not.
   * These two cases should be distinguished given the contradict semantics.
   */
  isAll: boolean,
  alias?: id<ENREEntityAlias<ENRERelationExport>>,
}

export const createRelationExport = (
  from: id<ENREEntityFile> | id<ENREEntityNamespace>,
  to: id<ENREEntityCollectionAll>,
  location: ENRELocation,
  {
    kind = 'any',
    isDefault = false,
    isAll = false,
    sourceRange = undefined,
    alias = undefined,
  }: Pick<ENRERelationExport, 'kind' | 'isDefault' | 'isAll' | 'sourceRange' | 'alias'>,
): ENRERelationExport => {
  const rel = {
    ...addAbilityBase(from, to, location),

    type: 'export',

    kind,

    isDefault,

    isAll,

    alias,

    sourceRange,
  };

  if (alias) {
    alias.ofRelation = rel as ENRERelationExport;
  }

  return rel as ENRERelationExport;
};

export const recordRelationExport = recordRelation(createRelationExport);
