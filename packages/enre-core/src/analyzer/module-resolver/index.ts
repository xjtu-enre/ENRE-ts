import {eGraph, ENREEntityFile, ENREEntityPackage, id, recordThirdPartyEntityPackage} from '@enre/data';
import {supportedFileExt} from '@enre/shared';
import path from 'path';
import ENREName from '@enre/naming';

export default (currFile: ENREEntityFile, specifier: string): id<ENREEntityPackage> | id<ENREEntityFile> | undefined => {
  // Relative path
  if (specifier.startsWith('.')) {
    const extname = path.extname(specifier);
    // No extension name provided, we have to try several options
    if (extname === '') {
      for (const tryExt of supportedFileExt) {
        const fetched = eGraph.where({
          type: 'file',
          fullname: `<File ${path.resolve(path.dirname(currFile.path), specifier + tryExt)}>`,
        });
        if (fetched.length === 1) {
          return fetched[0] as id<ENREEntityFile>;
        }
      }
    } else {
      const fetched = eGraph.where({
        type: 'file',
        fullname: `<File ${path.resolve(path.dirname(currFile.path), specifier)}>`,
      });
      if (fetched.length === 1) {
        return fetched[0] as id<ENREEntityFile>;
      }
    }
  }
  /**
   * Subpath imports
   * TODO: Handle subpath imports after package.json is resolved.
   * @see https://nodejs.org/dist/latest-v18.x/docs/api/packages.html#subpath-imports
   */
  else if (specifier.startsWith('#')) {
    return;
  }
  // Built-in modules OR third-party modules
  else {
    // TODO: Built-in modules
    if (['', /* Node.js built-in modules */].includes(specifier)) {
      return;
    } else {
      /**
       * For third-party packages, only one entity will be created across multiple files.
       */
      const previouslyCreated = eGraph.where({
        type: 'package',
        name: specifier,
      });

      if (previouslyCreated.length === 1) {
        return previouslyCreated[0] as id<ENREEntityPackage>;
      } else if (previouslyCreated.length === 0) {
        return recordThirdPartyEntityPackage(
          new ENREName('Norm', specifier),
        );
      } else {
        // ???
      }
    }
  }
};
