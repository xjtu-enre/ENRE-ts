import {ENRELocation} from '@enre/location';
import ENREName from '@enre/naming';
import {ENREEntityFile} from '../structure/file';
import {ENREEntityCollectionAll} from '../collections';
import {id} from '../../utils/wrapper';
import {addAbilityImportExport, ENREEntityAbilityImportExport} from './import-export';

export interface ENREEntityAbilityBase extends ENREEntityAbilityImportExport {
  name: ENREName<any>,
  type: string,
  parent: id<ENREEntityCollectionAll>,
  location: ENRELocation,
  children: id<ENREEntityCollectionAll>[],
  /**
   * Add import/export ability to all entities in case dynamic import()
   * and TypeScript namespace import/export.
   */

  getQualifiedName: () => string,
  getSourceFile: () => id<ENREEntityFile>,
}

export const addAbilityBase = (
  name: ENREName<any>,
  location: ENRELocation,
  parent: id<ENREEntityCollectionAll>,
): ENREEntityAbilityBase => {
  const children: id<ENREEntityCollectionAll>[] = [];

  return {
    ...addAbilityImportExport(),

    name,

    type: '',

    parent,

    location,

    children,

    getQualifiedName() {
      return parent.getQualifiedName() + '.' + name.string;
    },

    getSourceFile() {
      let ref: ENREEntityCollectionAll | undefined = parent;
      while (ref && ref.type !== 'file') {
        ref = ref.parent;
      }
      return ref as id<ENREEntityFile>;
    },
  };
};
