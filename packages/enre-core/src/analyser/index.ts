import {parse} from '@babel/parser';
import traverse from '@babel/traverse';
import {eGraph, ENREEntityCollectionScoping, recordEntityFile} from '@enre/container';
import env from '@enre/environment';
import {panic, verbose} from '@enre/logging';
import path from 'path';
import {getFileContent} from '../utils/fileFinder';
import traverseOpts from './visitors';

/**
 * Read, parse and analyse a single file by a giving file path.
 */
export const analyse = async (filePath: string) => {
  const currFile = recordEntityFile(
    path.basename(filePath),
    [path.dirname(filePath)],
    // TODO: sourceType detect
    'module');

  verbose(`Record Entity File: ${currFile.fullName}`);

  const content = await getFileContent(filePath);

  const ast = parse(content, {
    startColumn: 1,
    sourceType: currFile.sourceType,
    plugins: ['typescript'],
  });

  /**
   * A stack to help trace AST traverse process for parent determination.
   *
   * The first element is always the file to be processed.
   */
  const scopeProvider: Array<ENREEntityCollectionScoping> = [currFile];

  // @ts-ignore Importing cjs module in esm module
  traverse.default(ast, traverseOpts(scopeProvider));
};

export const cleanAnalyse = () => {
  if (!env.test) {
    panic('Function cleanAnalyse can only run under the TEST environment');
  }

  eGraph.reset();
};
