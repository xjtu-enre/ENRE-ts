import path from 'path';
import eGraph from '../../container/e';
import {ENRERelationExport} from '../../relation/variant/export';
import {ENRERelationImport} from '../../relation/variant/import';
import {ENREEntityCollectionInFile} from '../collections';
import {ENREName} from '@enre/naming';

export interface ENREEntityFile {
  readonly id: number,
  readonly name: ENREName,
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
  fileName: ENREName,
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
      return path.resolve(...pathSegment, fileName.codeName);
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
