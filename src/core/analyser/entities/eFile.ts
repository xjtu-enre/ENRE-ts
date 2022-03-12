import {ENREEntityCollectionInFile} from './index';
import global from '../../utils/global';
import path from 'path';

export interface ENREEntityFile {
  readonly id: number,
  readonly name: string,
  readonly fullName: string,
  readonly type: 'file',
  readonly sourceType: 'module' | 'script',   // may be changed in further learning
  children: {
    add: (entity: ENREEntityCollectionInFile) => void,
    get: () => Array<ENREEntityCollectionInFile>
  },
  imports: {
    add: (entity: ENREEntityCollectionInFile) => void,
    get: () => Array<ENREEntityCollectionInFile>
  },
  exports: {
    add: (entity: ENREEntityCollectionInFile) => void,
    get: () => Array<ENREEntityCollectionInFile>
  }
}

export const recordEntityFile = (
  fileName: string,
  pathSegment: Array<string>,
  sourceType: 'module' | 'script'): ENREEntityFile => {

  const _id: number = global.idGen();
  let _children: Array<ENREEntityCollectionInFile> = [];
  let _imports: Array<ENREEntityCollectionInFile> = [];
  let _exports: Array<ENREEntityCollectionInFile> = [];

  const _obj = {
    get id() {
      return _id;
    },
    get name() {
      return fileName;
    },
    get fullName() {
      return path.resolve(...pathSegment, fileName);
    },
    get type() {
      return 'file' as 'file';
    },
    get sourceType() {
      return sourceType;
    },
    children: {
      add: (entity: ENREEntityCollectionInFile) => {
        _children.push(entity);
      },
      get: () => {
        return _children;
      }
    },
    imports: {
      add: (entity: ENREEntityCollectionInFile) => {
        _imports.push(entity);
      },
      get: () => {
        return _imports;
      }
    },
    exports: {
      add: (entity: ENREEntityCollectionInFile) => {
        _imports.push(entity);
      },
      get: () => {
        return _exports;
      }
    }
  };

  global.eContainer.add(_obj);

  return _obj;
};
