import {ENRELocation} from '@enre/location';
import {ENREName} from '@enre/naming';
import eGraph from '../container/eContainer';
import {ENREEntityCollectionAll, ENREEntityCollectionInFile} from './collections';

export interface ENREEntityBase<ParentType = ENREEntityCollectionAll, ChildType = ENREEntityCollectionInFile> {
  readonly id: number,
  readonly name: ENREName,
  readonly fullName: string,
  readonly parent: ParentType,
  readonly sourceFile: undefined,
  readonly location: ENRELocation,
  readonly children: Array<ChildType>,
}

export const recordEntityBase = <ParentType = ENREEntityCollectionAll, ChildType = ENREEntityCollectionInFile>(
  name: ENREName,
  location: ENRELocation,
  parent: ParentType,
): ENREEntityBase<ParentType, ChildType> => {
  const _id: number = eGraph.nextId;
  const _children: Array<ChildType> = [];

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

    get children() {
      return _children;
    }
  };
};

// TODO: Handle scope properly
