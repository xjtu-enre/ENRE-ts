import path from 'path';
import global from '../../utils/global';

const BaseEntity = (name: string, pathSegment: Array<string>) => {
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

const a = BaseEntity('aaa', ['d://dir', 'to', 'file.js']);
