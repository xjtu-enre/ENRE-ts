import path from 'path';
import {ENREEntityCollectionInFile} from '../collections';
import ENREName from '@enre/naming';
import {addAbilityImportExport, ENREEntityAbilityImportExport} from '../ability/import-export';
import LogManager from '../../log/log-manager';
import {sourceLang, sourceType} from '@enre/shared';
import {id, recordEntity} from '../../utils/wrapper';
import {ENREEntityPackage} from './package';

export interface ENREEntityFile extends ENREEntityAbilityImportExport {
  name: ENREName<'File'>,
  parent?: ENREEntityPackage,
  type: 'file',
  sourceType: sourceType,
  lang: sourceLang,
  children: id<ENREEntityCollectionInFile>[],
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
  const children: id<ENREEntityCollectionInFile>[] = [];
  const logs = new LogManager();

  return {
    ...addAbilityImportExport(),

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
