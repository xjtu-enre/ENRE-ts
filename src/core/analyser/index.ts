import {parse, ParseResult} from "@babel/parser";
import traverse from "@babel/traverse";

export const analyse = (content: string) => {
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
