import {ENREEntityCollectionAll, ENREEntityFile, ENREEntityVariable, id, recordRelationExport} from '@enre/data';
import {ENREContext} from './index';
import {defaultLocation} from '@enre/location';

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
  proposer: id<ENREEntityFile>,
  lifeCycle: ModifierLifeCycleKind.disposable | ModifierLifeCycleKind.onCondition,
  isDefault: boolean,
} | {
  type: ModifierType.acceptProperty,
  proposer: id<ENREEntityVariable>,
  lifeCycle: ModifierLifeCycleKind.disposable,
}

// TODO: Some util functions should be also provided.
export type ModifierStack = Modifier[];

export const createModifierStackHandler = ({modifier}: ENREContext) => {
  return (entity: id<ENREEntityCollectionAll>) => {
    if (modifier.length === 0) {
      return;
    }

    const top = modifier.at(-1) as Modifier;

    if (top.type === ModifierType.export) {
      recordRelationExport(
        top.proposer,
        entity,
        // @ts-ignore
        entity?.location || defaultLocation,
        {kind: 'any', isDefault: top.isDefault, isAll: false, sourceRange: undefined, alias: undefined},
      );
      if (top.lifeCycle === ModifierLifeCycleKind.disposable) {
        modifier.pop();
      }
    }
  };
};
