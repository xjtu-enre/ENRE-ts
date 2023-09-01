import ENREName from '@enre/naming';
import {ENREEntityCollectionInFile} from '../collections';
import {blockKind} from '@enre/shared';

export interface ENREEntityBlock {
  name: ENREName<any>,
  type: 'block',
  kind: blockKind,
  children: ENREEntityCollectionInFile[],
}

export const createEntityBlock = (kind: blockKind = 'any'): ENREEntityBlock => {
  const name = new ENREName('Norm', '');
  const children: ENREEntityCollectionInFile[] = [];

  return {
    name,

    type: 'block',

    kind,

    children,
  };
};
