import ENREName from '@enre/naming';
import eGraph from '../../container/e';
import {recordEntity} from '../../misc/wrapper';
import {ENREEntityFile} from '@enre/data';

export interface ENREEntityPackage {
  id: number,
  name: ENREName<'Norm'>,
  parent: undefined,
  children: ENREEntityFile[],
  type: 'package',
  pkgJson: any,
  // TODO
  fileTree: any,

  getQualifiedName: () => string,
}

export const createEntityPackage = (name: ENREName<'Norm'>, pkgJson: any) => {
  const id = eGraph.nextId;
  const children: ENREEntityFile[] = [];

  return {
    id,

    type: 'package',

    name,

    pkgJson,

    children,

    getQualifiedName() {
      return name;
    },
  };
};

export const recordEntityPackage = recordEntity(createEntityPackage);
