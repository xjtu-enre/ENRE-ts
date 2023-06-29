import ENREName from '@enre/naming';
import {ENREEntityCollectionInFile} from '../collections';
import eGraph from '../../container/e';
import {blockKind} from '@enre/shared';

export interface ENREEntityBlock {
  id: number,
  name: ENREName<any>,
  type: 'block',
  kind: blockKind,
  children: ENREEntityCollectionInFile[],
}

export const createEntityBlock = (kind: blockKind = 'any'): ENREEntityBlock => {
  const id = eGraph.nextId;
  const name = new ENREName('Norm', '');
  const children: ENREEntityCollectionInFile[] = [];

  return {
    id,

    name,

    type: 'block',

    kind,

    children,
  };
};
