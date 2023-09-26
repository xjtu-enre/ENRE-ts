import {
  ENREEntityCollectionAll,
  ENREEntityFile,
  ENREEntityNamespace,
  ENREEntityVariable,
  id,
  recordRelationExport
} from '@enre/data';
import {ENREContext} from './index';
import {defaultLocation, ENRELocation, isLocAInLocB} from '@enre/location';

export enum ModifierType {
  export,
  acceptProperty,
}

type Modifier = {
  type: ModifierType.export,
  proposer: id<ENREEntityFile> | id<ENREEntityNamespace>,
  validRange: ENRELocation[],
  isDefault: boolean,
} | {
  type: ModifierType.acceptProperty,
  proposer: id<ENREEntityVariable>,
}

export type ModifierTable = Map<string, Modifier>;

export const createModifierHandler = ({modifiers}: ENREContext) => {
  return (entity: id<ENREEntityCollectionAll>) => {
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
