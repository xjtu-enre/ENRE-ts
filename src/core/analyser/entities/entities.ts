import path from 'path';
import global from '../../utils/global';

const baseEntity = (name: string, pathSegment: Array<string>) => {
  const _id: number = global.idGen();

  return {
    get id() {
      return _id;
    },

    get name() {
      return name;
    },

    get fullName() {
      return path.resolve(...pathSegment) + `:${name}`;
    }
  }
}

export const sourceFileEntity = (fileName: string, pathSegment: Array<string>) => {
  const _base = baseEntity(fileName, pathSegment);

  return {
    ..._base,

    type: 'sourceFile'
  }
}


