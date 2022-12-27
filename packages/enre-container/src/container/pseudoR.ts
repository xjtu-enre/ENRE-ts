import {ENREEntityCollectionScoping, ENRERelationCollectionAll} from '@enre/container';
import {ENRERelationAbilityBase} from '../relation/ability/base';

/**
 * Rich object containing necessary guidance information for
 * entity binding.
 */
type SearchingGuidance =
/**
 * Searching in the default export of a file.
 */
  { role: 'default-export' }
  /**
   * Searching the corresponded identifier with certain role.
   * Modifiers 'exportsOnly' (only searching in all exports)
   * and 'localOnly' (only searching for local symbols, excluding imports)
   * are also available.
   */
  | { role: 'value' | 'type' | 'all', identifier: string, exportsOnly?: boolean, localOnly?: boolean };

/**
 * This is half-ended relation, which serve as intermediate result
 * of the final relation.
 *
 * Pseudo relations allow `to` to optionally be string identifier
 * that will be fetched and linked to real entity object after the first pass.
 */
export type ENREPseudoRelation<T extends ENRERelationAbilityBase = ENRERelationCollectionAll> =
  Omit<T, 'to'>
  // Two pending request wouldn't show up at the same time
  & { to: SearchingGuidance }
  & { at: ENREEntityCollectionScoping };

const createPseudoRelationContainer = () => {
  let _pr: Array<ENREPseudoRelation> = [];

  return {
    add: <T extends ENRERelationAbilityBase = ENRERelationCollectionAll>(relation: ENREPseudoRelation<T>) => {
      // @ts-ignore
      _pr.push(relation);
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
