import {ENREEntityCollectionAll, ENREEntityCollectionInFile, ENRELocation} from './index';
import global from '../../utils/global';

export interface ENREEntityBase {
  readonly id: number,
  readonly name: string,
  readonly fullName: string,
  readonly parent: ENREEntityCollectionAll,
  readonly sourceFile: undefined,
  readonly location: ENRELocation,
  children: {
    add: (entity: ENREEntityCollectionInFile) => void,
    get: () => Array<ENREEntityCollectionInFile>
  }
}

export const recordEntityBase = (
  name: string,
  location: ENRELocation,
  parent: ENREEntityCollectionAll
): ENREEntityBase => {
  const _id: number = global.idGen();
  let _children: Array<ENREEntityCollectionInFile> = [];

  return {
    get id() {
      return _id;
    },

    get name() {
      return name;
    },

    get fullName() {
      // TODO: Path segment should be migrant from flat to hierarchical
      return 'Under development';
    },

    get parent() {
      return parent;
    },

    get sourceFile() {
      return undefined;
    },

    get location() {
      return location;
    },

    children: {
      add: (entity: ENREEntityCollectionInFile) => {
        _children.push(entity);
      },
      get: () => {
        return _children;
      }
    }
  };
};
