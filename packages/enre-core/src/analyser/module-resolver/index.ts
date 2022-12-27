import {eGraph, ENREEntityFile} from '@enre/container';
import path from 'path';

// TODO: After implementing the universal file finder, this functionality should be integrated into it.
const searchingList = ['.ts', '.js', '.mjs', '.cjs', '.tsx', '.jsx'];

export default (currFile: ENREEntityFile, specifier: string): ENREEntityFile | undefined => {
  // Relative path
  if (specifier.startsWith('.')) {
    const extname = path.extname(specifier);
    // No extension name provided, we have to try several options
    if (extname === '') {
      for (const tryExt of searchingList) {
        const fetched = eGraph.where({
          type: 'file',
          fullname: path.resolve(path.dirname(currFile.fullname), specifier + tryExt),
        });
        if (fetched.length === 1) {
          return fetched[0] as ENREEntityFile;
        }
      }
    } else {
      const fetched = eGraph.where({
        type: 'file',
        fullname: path.resolve(path.dirname(currFile.fullname), specifier),
      });
      if (fetched.length === 1) {
        return fetched[0] as ENREEntityFile;
      }
    }
  }
  // TODO: Not all other cases are external package
  else {
    return;
  }
};
