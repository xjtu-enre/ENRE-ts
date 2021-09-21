import {parse, ParseResult} from "@babel/parser";

export const analyse = (content: string) => {
  const ast: ParseResult<any> = parse(content, {
    sourceType: "module"
  });
  console.log(ast);
}
