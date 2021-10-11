import path from 'path';
import global from '../../utils/global';

export interface sourceFileE{
  readonly id: number,
  readonly name: string,
  readonly fullName: string,
  readonly type: "sourceFile",
  children: {
    add: (eid: number) => void,
    get: () => Array<number>
  },
  imports: {
    add: (eid: number) => void,
    get: () => Array<number>
  },
  exports: {
    add: (eid: number) => void,
    get: () => Array<number>
  }
}

export const sourceFileEntity = (fileName: string, pathSegment: Array<string>): sourceFileE => {
  const _id: number = global.idGen();
  let _children: Array<number> = [];
  let _imports: Array<number> = [];
  let _exports: Array<number> = [];

  return {
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
      return "sourceFile" as "sourceFile";
    },
    children: {
      add: eid => {
        _children.push(eid);
      },
      get: () => {
        return _children;
      }
    },
    imports: {
      add: eid => {
        _imports.push(eid);
      },
      get: () => {
        return _imports;
      }
    },
    exports: {
      add: eid => {
        _imports.push(eid);
      },
      get: () => {
        return _exports;
      }
    }
  }
}

interface baseE {
  readonly id: number,
  readonly name: string,
  readonly fullName: string,
  readonly parent: number | undefined,
  children: {
    add: (eid: number) => void,
    get: () => Array<number>
  }
}

const baseEntity = (name: string, parent?: number): baseE => {
  const _id: number = global.idGen();
  let _children: Array<number> = [];

  return {
    get id() {
      return _id;
    },

    get name() {
      return name;
    },

    get fullName() {
      // TODO: Path segment should be migrant from flat to hierarchical
      return 'Under development'
    },

    get parent() {
      return parent;
    },

    children: {
      add: eid => {
        _children.push(eid);
      },
      get: () => {
        return _children;
      }
    }
  }
}
