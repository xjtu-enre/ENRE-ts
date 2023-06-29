import {
  ENREEntityCollectionAll,
  ENREEntityCollectionInFile,
  ENREEntityFile,
  ENREEntityVariable,
  recordRelationExport
} from '@enre/data';
import {ENREContext} from './index';

export enum ModifierType {
  export,
  acceptProperty,
}

export enum ModifierLifeCycleKind {
  disposable,
  onCondition,
  permanent,
}

type Modifier = {
  type: ModifierType.export,
  proposer: ENREEntityFile,
  lifeCycle: ModifierLifeCycleKind.disposable | ModifierLifeCycleKind.onCondition,
  isDefault: boolean,
} | {
  type: ModifierType.acceptProperty,
  proposer: ENREEntityVariable,
  lifeCycle: ModifierLifeCycleKind.disposable,
}

// TODO: Some util functions should be also provided.
export type ModifierStack = Modifier[];

export const createModifierStackHandler = ({modifier}: ENREContext) => {
  return (entity: ENREEntityCollectionAll) => {
    if (modifier.length === 0) {
      return;
    }

    const top = modifier.at(-1) as Modifier;

    if (top.type === ModifierType.export) {
      recordRelationExport(
        top.proposer,
        entity,
        (entity as ENREEntityCollectionInFile).location,
        {kind: 'any', isDefault: top.isDefault, isAll: false, sourceRange: undefined, alias: undefined},
      );
      if (top.lifeCycle === ModifierLifeCycleKind.disposable) {
        modifier.pop();
      }
    }
  };
};
