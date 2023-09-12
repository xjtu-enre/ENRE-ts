import {ENREEntityFile, id} from '@enre/data';
import {ModifierStack} from './modifier-stack';
import {ENREScope} from './scope';

export interface ENREContext {
  file: ENREEntityFile,
  scope: ENREScope,
  modifier: ModifierStack,
}

export default function (file: id<ENREEntityFile>): ENREContext {
  return {
    file,
    scope: new ENREScope(file),
    modifier: [],
  };
}
