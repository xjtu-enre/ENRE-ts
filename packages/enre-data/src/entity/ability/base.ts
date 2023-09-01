import {ENRELocation} from '@enre/location';
import ENREName from '@enre/naming';
import {ENREEntityFile} from '../structure/file';
import {ENREEntityCollectionAll} from '../collections';
import {id} from '../../utils/wrapper';

export interface ENREEntityAbilityBase {
  name: ENREName<any>,
  type: string,
  parent: id<ENREEntityCollectionAll>,
  location: ENRELocation,
  children: id<ENREEntityCollectionAll>[],

  getQualifiedName: () => string,
  getSourceFile: () => id<ENREEntityFile>,
}

export const addAbilityBase = (
  name: ENREName<any>,
  location: ENRELocation,
  parent: id<ENREEntityCollectionAll>,
): ENREEntityAbilityBase => {
  const children: id<ENREEntityCollectionAll>[] = [];

  return {
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
      return ref as id<ENREEntityFile>;
    },
  };
};
