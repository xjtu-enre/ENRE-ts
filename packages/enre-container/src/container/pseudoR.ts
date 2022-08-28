import {ENREEntityCollectionScoping, ENRERelationCollectionAll} from '@enre/container';

type idInfo =
  { role: 'value' | 'type' | 'all', identifier: string, exportsOnly?: boolean, noImport?: boolean }
  | { role: 'export-default' };

/**
 * These are half-ended relations, which serve as intermediate results
 * of final relations.
 *
 * Pseudo relations allow `from` and `to` to optionally be string identifier
 * that will be fetched and linked to real entity object after the first pass.
 */
export type ENREPseudoRelation =
  Omit<ENRERelationCollectionAll, 'to'>
  // Two pending request wouldn't show up at the same time
  & { to: idInfo }
  & { at: ENREEntityCollectionScoping };

const createPseudoRelationContainer = () => {
  let _pr: Array<ENREPseudoRelation> = [];

  return {
    add: (relation: ENREPseudoRelation) => {
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
