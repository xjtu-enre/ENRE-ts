import {ENRELocation} from '@enre/location';
import ENREName from '@enre/naming';
import eGraph from '../../container/e';
import {ENREEntityFile} from '../structure/file';
import {ENREEntityCollectionAll} from '../collections';

export interface ENREEntityAbilityBase {
  id: number,
  name: ENREName<any>,
  type: string,
  parent: ENREEntityCollectionAll,
  location: ENRELocation,
  children: Array<ENREEntityCollectionAll>,

  getQualifiedName: () => string,
  getSourceFile: () => ENREEntityFile,
}

export const addAbilityBase = (
  name: ENREName<any>,
  location: ENRELocation,
  parent: ENREEntityCollectionAll,
): ENREEntityAbilityBase => {
  const id = eGraph.nextId;
  const children: ENREEntityCollectionAll[] = [];

  return {
    id,

    name,

    type: '',

    parent,

    location,

    children,

    getQualifiedName() {
      let tmp = name.string;
      let cursor: ENREEntityCollectionAll | undefined = parent;

      while (cursor) {
        tmp = cursor.name.string + '.' + tmp;

        cursor = cursor.parent;
      }
      return tmp;
    },

    getSourceFile() {
      let ref: ENREEntityCollectionAll | undefined = parent;
      while (ref && ref.type !== 'file') {
        ref = ref.parent;
      }
      return ref as ENREEntityFile;
    },
  };
};
