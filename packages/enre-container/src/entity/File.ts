import path from 'path';
import eGraph from '../container/eContainer';
import {ENREEntityCollectionInFile} from './collections';

export interface ENREEntityFile {
  readonly id: number,
  readonly name: string,
  readonly fullName: string,
  readonly type: 'file',
  readonly sourceType: 'module' | 'script',
  children: {
    add: (entity: ENREEntityCollectionInFile) => void,
    get: () => Array<ENREEntityCollectionInFile>
  },
  import: {
    add: (entity: ENREEntityCollectionInFile) => void,
    get: () => Array<ENREEntityCollectionInFile>
  },
  export: {
    add: (entity: ENREEntityCollectionInFile) => void,
    get: () => Array<ENREEntityCollectionInFile>
  }
}

export const recordEntityFile = (
  fileName: string,
  pathSegment: Array<string>,
  sourceType: 'module' | 'script'): ENREEntityFile => {

  const _id: number = eGraph.nextId;
  const _children: Array<ENREEntityCollectionInFile> = [];
  const _imports: Array<ENREEntityCollectionInFile> = [];
  const _exports: Array<ENREEntityCollectionInFile> = [];

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
      return 'file' as const;
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
    import: {
      add: (entity: ENREEntityCollectionInFile) => {
        _imports.push(entity);
      },
      get: () => {
        return _imports;
      }
    },
    export: {
      add: (entity: ENREEntityCollectionInFile) => {
        _imports.push(entity);
      },
      get: () => {
        return _exports;
      }
    }
  };

  eGraph.add(_obj);

  return _obj;
};
