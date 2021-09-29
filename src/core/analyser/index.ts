import {parse, ParseResult} from "@babel/parser";
import traverse from "@babel/traverse";
import global from "../utils/global";
import {sourceFileEntity} from './entities/entities';
import {getFileContent} from '../utils/fileResolver';

export const analyse = async (filePath: string) => {
  global.entityList.push(sourceFileEntity(filePath, ['']));

  const content = await getFileContent(filePath);

  const ast: ParseResult<any> = parse(content, {
    sourceType: "module",
    plugins: ['typescript']
  });

  traverse(ast, {
    // 'Identifier': path => {
    //   console.log(path.node.name);
    // },
    TSInterfaceDeclaration: path => {
      console.log('TSInterfaceDeclaration: ' + path.node.id.name)
    },
    Identifier: path => {
      console.log('Identifier: ' + path.node.name)

    }
  })
}
