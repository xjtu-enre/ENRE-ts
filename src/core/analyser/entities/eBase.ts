import {ENREEntityAll, ENREEntityInFile} from './index';
import global from '../../utils/global';
import {SourceLocation} from '@babel/types';

export interface ENREEntityBase {
  readonly id: number,
  readonly name: string,
  readonly fullName: string,
  readonly parent: ENREEntityAll,
  readonly sourceFile: undefined,
  readonly location: SourceLocation,
  children: {
    add: (entity: ENREEntityInFile) => void,
    get: () => Array<ENREEntityInFile>
  }
}

export const recordEntityBase = (
  name: string,
  location: SourceLocation,
  parent: ENREEntityAll
): ENREEntityBase => {
  const _id: number = global.idGen();
  let _children: Array<ENREEntityInFile> = [];

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
      add: (entity: ENREEntityInFile) => {
        _children.push(entity);
      },
      get: () => {
        return _children;
      }
    }
  };
};
