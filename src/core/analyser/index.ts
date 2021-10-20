import {parse, ParseResult} from '@babel/parser';
import traverse from '@babel/traverse';
import {recordEntityFile} from './entities/eFile';
import {getFileContent} from '../utils/fileResolver';
import traverseOpts from './traverseOpts';
import path from 'path';
import {ENREEntityScopeMaking} from './entities';

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

  // A stack to help trace AST traverse process for parent determine
  let scopeProvider: Array<ENREEntityScopeMaking> = [currFile];

  traverse(ast, traverseOpts(scopeProvider));
};
