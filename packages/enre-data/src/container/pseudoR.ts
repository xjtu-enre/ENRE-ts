import {
  ENREEntityAlias,
  ENREEntityCollectionScoping,
  ENREEntityFile,
  ENREEntityPackage,
  ENRERelationCollectionAll
} from '@enre/data';
import {ENRERelationAbilityBase} from '../relation/ability/base';
import {ENRERelationDecorate} from '../relation/variant/decorate';
import {ENRERelationType} from '../relation/variant/type';

/**
 * Rich object containing necessary guidance information for entity binding.
 */
export type SearchingGuidance =
/**
 * Searching in the default export of a file.
 */
  { role: 'default-export', at: ENREEntityPackage | ENREEntityFile } |
  /**
   * Searching the corresponded identifier with certain role.
   * Modifiers 'exportsOnly' (only searching in all exports)
   * and 'localOnly' (only searching for local symbols, excluding imports)
   * are also available.
   */
  {
    /**
     * Which context does the wanted entity in.
     *
     * This is different to TS `import/export type` in semantic.
     */
    role: 'value' | 'type' | 'any',
    identifier: string,
    // Start point of symbol searching
    at: ENREEntityCollectionScoping,
    // Only find in entity's exports
    exportsOnly?: boolean,
    // Not find in imports
    localOnly?: boolean
  };

type RelationCollectionUnboundFrom = ENRERelationType | ENRERelationDecorate;

/**
 * This is half-ended relation, which serve as intermediate result
 * of the final relation.
 *
 * Pseudo relations allow `from` or `to` to optionally be string identifier (based on relation type)
 * that will be fetched and linked to real entity object after the first pass.
 *
 * Currently, only one of `from` and `to` is allowed to be a searching guidance.
 */
export type ENREPseudoRelation<
  T extends ENRERelationAbilityBase = ENRERelationCollectionAll,
  U extends 'from' | 'to' = T extends RelationCollectionUnboundFrom ? 'from' : 'to',
> = // The rest of a relation
  Omit<T, U | 'isImplicit'>
  // The searching guidance of `from` entity or `to` entity
  & Record<U, SearchingGuidance>
  // Import/Export alias entity
  // TODO: How to narrow this as a conditional type if T extends Import/Export?
  & { alias?: ENREEntityAlias };

const createPseudoRelationContainer = () => {
  let _pr: Array<ENREPseudoRelation> = [];

  return {
    add: <T extends ENRERelationAbilityBase>(relation: ENREPseudoRelation<T>) => {
      // @ts-ignore
      _pr.push({resolved: false, ...relation});
    },

    get all() {
      return _pr;
    },

    get exports() {
      return _pr.filter(r => r.type === 'export');
    },

    get imports() {
      return _pr.filter(r => r.type === 'import');
    },

    reset: () => {
      _pr = [];
    }
  };
};

export default createPseudoRelationContainer();
