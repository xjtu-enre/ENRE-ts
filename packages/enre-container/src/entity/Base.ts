import {ENRELocation} from '@enre/location';
import {ENREName} from '@enre/naming';
import eGraph from '../container/eContainer';
import {ENREEntityCollectionAll, ENREEntityCollectionInFile} from './collections';

export interface ENREEntityBase {
  readonly id: number,
  readonly name: ENREName,
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
  name: ENREName,
  location: ENRELocation,
  parent: ENREEntityCollectionAll
): ENREEntityBase => {
  const _id: number = eGraph.nextId;
  const _children: Array<ENREEntityCollectionInFile> = [];

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

// TODO: Handle scope properly
