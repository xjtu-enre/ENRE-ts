import {eGraph, ENREEntityFile, recordEntityFile} from '@enre/data';
import path from 'path';
import {analyse} from './analyzer';
import linker from './analyzer/linker';
import {getFileList} from './utils/fileFinder';
import ENREName from '@enre/naming';
import {createLogger} from '@enre/shared';

export const logger = createLogger('core');
export const codeLogger = createLogger('code analysis');

export default async (
  iPath: string,
  exclude: Array<string> | undefined = undefined
) => {
  const fl = await getFileList(iPath, exclude);

  /**
   * PRE PASS: Create file entities for every entry.
   * TODO: Remove this when dedicated package & file extractor is done.
   */
  for (const f of fl) {
    const fParsed = path.parse(f);
    recordEntityFile(
      // TODO: fix hard code
      new ENREName('File', fParsed.base),
      [path.dirname(f)],
      // TODO: sourceType detect
      'module',
      // TODO: Migrate lang to ts enum
      path.extname(f).includes('ts') ? 'ts' : 'js');
  }

  /**
   * FIRST PASS: Extract entities and immediate relations, build entity graph.
   */
  for (const f of eGraph.where({type: 'file'})) {
    await analyse(f as ENREEntityFile);
  }

  /**
   * SECOND PASS: Work on pseudo relation container to link string into correlated entity object.
   */
  linker();

  /**
   * THIRD PASS: Based on full entity-relation graph, extracting relations that depends on full data (like 'override').
   */
  // TODO: advancedLinker();
};

export {default as preferences} from './utils/preferences';
export {cleanAnalysis} from './analyzer';
