export interface ENREFS {
  inputs: string[],
  excludes: string[],
  tree: ENREFSDir[],
  files: ENREFSFile[],
  pkgJsons: ENREFSFile[],
  [Symbol.iterator]: () => IterableIterator<ENREFSFile>,
}

export interface ENREFSDir {
  type: 'dir',
  name: string,
  fullname: string,
  dirs: ENREFSDir[],
  files: ENREFSFile[],
}

export interface ENREFSFile {
  type: 'file',
  name: string,
  fullname: string,
  ext: string,
  dir: ENREFSDir,
}
