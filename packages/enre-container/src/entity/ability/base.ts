import {ENRELocation} from '@enre/location';
import {ENREName} from '@enre/naming';
import eGraph from '../../container/e';
import {ENREEntityCollectionAll, ENREEntityCollectionInFile} from '../collections';
import {ENREEntityFile} from '../variant/file';

export interface ENREEntityAbilityBase<ParentType extends ENREEntityCollectionAll = ENREEntityCollectionAll,
  ChildType extends ENREEntityCollectionInFile = ENREEntityCollectionInFile> {
  readonly id: number,
  readonly name: ENREName,
  readonly fullname: string,
  readonly parent: ParentType,
  readonly sourceFile: ENREEntityFile,
  readonly location: ENRELocation,
  readonly children: Array<ChildType>,
}

export const recordEntityBase = <ParentType extends ENREEntityCollectionAll = ENREEntityCollectionAll,
  ChildType extends ENREEntityCollectionInFile = ENREEntityCollectionInFile>(
  name: ENREName,
  location: ENRELocation,
  parent: ParentType,
): ENREEntityAbilityBase<ParentType, ChildType> => {
  const _id: number = eGraph.nextId;
  const _children: Array<ChildType> = [];

  return {
    get id() {
      return _id;
    },

    get name() {
      return name;
    },

    get fullname() {
      let tmp = name.printableName;
      let index = parent;
      // TODO: Remove ts-ignores
      // @ts-ignore
      while (index.parent) {
        // @ts-ignore
        tmp = index.name.printableName + '.' + tmp;
        // @ts-ignore
        index = index.parent;
      }
      return tmp;
    },

    get parent() {
      return parent;
    },

    get sourceFile() {
      let ref = parent as ENREEntityCollectionAll;
      while (ref.type !== 'file') {
        ref = ref.parent;
      }
      return ref as ENREEntityFile;
    },

    get location() {
      return location;
    },

    get children() {
      return _children;
    }
  };
};
