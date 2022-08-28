import path from 'path';
import eGraph from '../container/e';
import {ENRERelationExport} from '../relation/Export';
import {ENRERelationImport} from '../relation/Import';
import {ENREEntityCollectionInFile} from './collections';

export interface ENREEntityFile {
  readonly id: number,
  readonly name: string,
  readonly fullname: string,
  readonly type: 'file',
  readonly sourceType: 'module' | 'script',
  readonly lang: 'js' | 'ts',
  children: ENREEntityCollectionInFile[],
  // Save imports/exports at file level to avoid searching in the whole database
  imports: ENRERelationImport[],
  exports: ENRERelationExport[],
}

export const recordEntityFile = (
  fileName: string,
  pathSegment: Array<string>,
  sourceType: 'module' | 'script',
  lang: 'js' | 'ts'
): ENREEntityFile => {
  const _id: number = eGraph.nextId;
  const _children: ENREEntityCollectionInFile[] = [];
  const _imports: ENRERelationImport[] = [];
  const _exports: ENRERelationExport[] = [];

  const _obj = {
    get id() {
      return _id;
    },

    get name() {
      return fileName;
    },

    get fullname() {
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
