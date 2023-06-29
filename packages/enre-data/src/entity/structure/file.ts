import path from 'path';
import eGraph from '../../container/e';
import {ENREEntityCollectionInFile} from '../collections';
import ENREName from '@enre/naming';
import {addAbilityImportExport, ENREEntityAbilityImportExport} from '../ability/import-export';
import LogManager from '../../misc/log-manager';
import {sourceLang, sourceType} from '@enre/shared';
import {recordEntity} from '../../misc/wrapper';
import {ENREEntityPackage} from './package';

export interface ENREEntityFile extends ENREEntityAbilityImportExport {
  id: number,
  name: ENREName<'File'>,
  parent?: ENREEntityPackage,
  type: 'file',
  sourceType: sourceType,
  lang: sourceLang,
  children: ENREEntityCollectionInFile[],
  // Screening logs are saved in its belonging file entity.
  logs: LogManager,

  getQualifiedName: () => string,
}

export const createEntityFile = (
  name: ENREName<'File'>,
  pathSegment: Array<string>,
  sourceType: sourceType,
  lang: sourceLang,
): ENREEntityFile => {
  const id = eGraph.nextId;
  const children: ENREEntityCollectionInFile[] = [];
  const logs = new LogManager();

  return {
    ...addAbilityImportExport(),

    id,

    name,

    type: 'file',

    sourceType,

    lang,

    children,

    logs,

    getQualifiedName() {
      return path.resolve(...pathSegment, name.codeName);
    },
  };
};

export const recordEntityFile = recordEntity(createEntityFile);
