import {
  ENREEntityCollectionAll,
  ENREEntityFile,
  ENREEntityNamespace,
  ENREEntityVariable,
  recordRelationExport
} from '@enre-ts/data';
import {ENREContext} from './index';
import {defaultLocation, ENRELocation, isLocAInLocB} from '@enre-ts/location';

export enum ModifierType {
  export,
  acceptProperty,
}

type Modifier = {
  type: ModifierType.export,
  proposer: ENREEntityFile | ENREEntityNamespace,
  validRange: ENRELocation[],
  isDefault: boolean,
} | {
  type: ModifierType.acceptProperty,
  proposer: ENREEntityVariable,
}

export type ModifierTable = Map<string, Modifier>;

export const createModifierHandler = ({modifiers}: ENREContext) => {
  return (entity: ENREEntityCollectionAll) => {
    for (const [_, modifier] of modifiers) {
      if (modifier.type === ModifierType.export) {
        if ('location' in entity) {
          for (const location of modifier.validRange) {
            if (isLocAInLocB(entity.location, location)) {
              recordRelationExport(
                modifier.proposer,
                entity,
                entity.location || defaultLocation,
                {kind: 'any', isDefault: modifier.isDefault, isAll: false, sourceRange: undefined, alias: undefined},
              );
              break;
            }
          }
        }
      }
    }
  };
};
