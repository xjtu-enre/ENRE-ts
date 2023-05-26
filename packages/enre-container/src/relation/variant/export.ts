import {ENREEntityCollectionAll} from '../../entity/collections';
import {ENREEntityFile} from '../../entity/variant/file';
import {ENRELocation} from '@enre/location';
import rGraph from '../../container/r';
import {ENRERelationAbilityBase, recordRelationBase} from '../ability/base';
import {ENRERelationAbilityExplicitSymbolRole} from '../ability/explicit-symbol-role';
import {ENRERelationAliasOf} from './aliasof';
import {ENRERelationAbilitySourceRange} from '../ability/source-range';

export interface ENRERelationExport extends ENRERelationAbilityBase, ENRERelationAbilityExplicitSymbolRole, Partial<ENRERelationAbilitySourceRange> {
  readonly type: 'export',
  readonly kind: 'any' | 'type',
  readonly isDefault: boolean,
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
  readonly isAll: boolean,
  alias?: ENRERelationAliasOf<ENRERelationExport>,
}

export const recordRelationExport = (
  from: ENREEntityFile,
  to: ENREEntityCollectionAll,
  location: ENRELocation,
  {
    kind = 'any',
    isDefault = false,
    isAll = false,
    sourceRange = undefined,
  }: Partial<Pick<ENRERelationExport, 'kind' | 'isDefault' | 'isAll' | 'sourceRange'>>
    = {kind: 'any', isDefault: false, isAll: false, sourceRange: undefined}
): ENRERelationExport => {
  const _base = recordRelationBase(from, to, location);
  let alias: ENRERelationAliasOf<ENRERelationExport>;

  const _obj = {
    ..._base,

    get type() {
      return 'export' as const;
    },

    get kind() {
      return kind;
    },

    set alias(value: ENRERelationAliasOf<ENRERelationExport> | undefined) {
      if (value) {
        alias = value;
        value.binding = this;
      }
    },

    get alias() {
      return alias;
    },

    get isDefault() {
      return isDefault;
    },

    get isAll() {
      return isAll;
    },

    get sourceRange() {
      return sourceRange;
    }
  };

  rGraph.add(_obj);

  return _obj;
};
