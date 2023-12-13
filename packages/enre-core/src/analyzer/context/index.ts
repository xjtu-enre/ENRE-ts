import {ENREEntityFile, id} from '@enre-ts/data';
import {ModifierTable} from './modifier';
import {ENREScope} from './scope';

export interface ENREContext {
  file: ENREEntityFile,
  scope: ENREScope,
  modifiers: ModifierTable,
}

export default function (file: ENREEntityFile): ENREContext {
  return {
    file,
    scope: new ENREScope(file),
    modifiers: new Map(),
  };
}
