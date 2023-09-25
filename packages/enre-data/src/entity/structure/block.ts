import ENREName from '@enre/naming';
import {ENREEntityAbilityBase, ENREEntityCollectionInFile, id} from '@enre/data';
import {blockKind} from '@enre/shared';
import {recordEntity} from '../../utils/wrapper';
import {ENRELocation} from '@enre/location';
import {addAbilityBase} from '../ability/base';

export interface ENREEntityBlock extends ENREEntityAbilityBase {
  type: 'block',
  kind: blockKind,
}

export const createEntityBlock = (
  kind: blockKind = 'any',
  location: ENRELocation,
  parent: id<ENREEntityCollectionInFile>,
): ENREEntityBlock => {
  const name = new ENREName('Anon', 'Block', `${location.start.line}:${location.start.column}`);

  return {
    ...addAbilityBase(name, location, parent),

    type: 'block',

    kind,

    getQualifiedName() {
      return parent.getQualifiedName() + '.' + `<Block ${location.start.line}:${location.start.column}>`;
    },
  };
};

export const recordEntityBlock = recordEntity(createEntityBlock);
