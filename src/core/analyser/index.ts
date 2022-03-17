import {parse, ParseResult} from '@babel/parser';
import traverse from '@babel/traverse';
import {recordEntityFile} from './entities/eFile';
import {getFileContent} from '../utils/fileResolver';
import traverseOpts from './traverseOpts';
import path from 'path';
import {ENREEntityCollectionScoping} from './entities';
import global from '../utils/global';
import env from '../utils/env';
import {errorAndExit} from '../utils/cliRender';

/**
 * Read, parse and analyse a single file by a giving file path.
 */
export const analyse = async (filePath: string) => {
  const currFile = recordEntityFile(
    path.basename(filePath),
    [path.dirname(filePath)],
    // TODO: sourceType detect
    'module');

  const content = await getFileContent(filePath);

  const ast = parse(content, {
    sourceType: currFile.sourceType,
    plugins: ['typescript']
  });

  /**
   * A stack to help trace AST traverse process for parent determination.
   *
   * The first element is always the file to be processed.
   */
  const scopeProvider: Array<ENREEntityCollectionScoping> = [currFile];

  traverse(ast, traverseOpts(scopeProvider));
};

export const cleanAnalyse = () => {
  if (!env.test) {
    errorAndExit('Function cleanAnalyse can only run under the TEST environment');
  }

  global.reset();
};
