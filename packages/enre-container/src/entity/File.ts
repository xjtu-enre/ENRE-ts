import path from 'path';
import eGraph from '../container/e';
import {ENREEntityCollectionInFile} from './collections';

export interface ENREEntityFile {
  readonly id: number,
  readonly name: string,
  readonly fullName: string,
  readonly type: 'file',
  readonly sourceType: 'module' | 'script',
  readonly lang: 'js' | 'ts',
  children: Array<ENREEntityCollectionInFile>,
  imports: Array<ENREEntityCollectionInFile>,
  exports: Array<ENREEntityCollectionInFile>,
}

export const recordEntityFile = (
  fileName: string,
  pathSegment: Array<string>,
  sourceType: 'module' | 'script',
  lang: 'js' | 'ts'
): ENREEntityFile => {
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

    get lang() {
      return lang;
    },

    get children() {
      return _children;
    },

    get imports() {
      return _imports;
    },

    get exports() {
      return _exports;
    }
  };

  eGraph.add(_obj);

  return _obj;
};
