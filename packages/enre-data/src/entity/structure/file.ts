import {ENREEntityCollectionInFile} from '../collections';
import ENREName from '@enre/naming';
import {addAbilityImportExport, ENREEntityAbilityImportExport} from '../ability/import-export';
import LogManager from '../../log/log-manager';
import {sourceLang, sourceType} from '@enre/shared';
import {id, recordEntity} from '../../utils/wrapper';
import {ENREEntityPackage} from './package';

export interface ENREEntityFile extends ENREEntityAbilityImportExport {
  name: ENREName<'File'>,
  path: string,
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
  path: string,
  sourceType: sourceType,
  lang: sourceLang,
  parent?: ENREEntityPackage,
): ENREEntityFile => {
  const children: id<ENREEntityCollectionInFile>[] = [];
  const logs = new LogManager();

  return {
    ...addAbilityImportExport(),

    name,

    path,

    type: 'file',

    sourceType,

    lang,

    parent,

    children,

    logs,

    getQualifiedName() {
      // If belonging package exists, use package name as prefix
      if (parent) {
        return `${parent.getQualifiedName()}.<File ${path.slice(parent.path!.length + 1)}>`;
      } else {
        return path;
      }
    },
  };
};

export const recordEntityFile = recordEntity(createEntityFile);
