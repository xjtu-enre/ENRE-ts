import {promises as fs} from 'fs';
import {marked} from 'marked';
import {logger} from './index';
import Link = marked.Tokens.Link;

interface TypeItem {
  name: string,
  path: string,
}

type ReturnType = { entity: TypeItem[], relation: TypeItem[], implicit: TypeItem[], [index: string]: TypeItem[] };

export default async (): Promise<ReturnType> => {
  const result: ReturnType = {entity: [], relation: [], implicit: []};

  try {
    const f = await fs.readFile('./docs/README.md', 'utf-8');

    const tokens = new marked.Lexer().lex(f as string);
    let scope: 'entity' | 'relation' | undefined = undefined;

    // Currently the format of README is simple and no need for restricting it with FSM.
    for (const t of tokens) {
      switch (t.type) {
        case 'heading':
          if (t.depth === 2) {
            if (t.text === 'Entity Categories') {
              scope = 'entity';
            } else if (t.text === 'Relation Categories') {
              scope = 'relation';
            } else {
              scope = undefined;
            }
          }
          break;

        case 'table':
          if (scope) {
            for (const row of t.rows) {
              if (row.length !== 2) {
                logger.error('Failed to parser docs/README.md');
              }

              if (row[0].tokens[0].type !== 'link') {
                logger.error('Expecting a link as the first column item');
              }

              const link = row[0].tokens[0] as Link;

              result[scope].push({name: link.text, path: link.href});
            }
          }

          break;
      }
    }
  } catch (e: any) {
    if (e.code === 'ENOENT') {
      logger.error('Cannot find README at docs/README.md');
    } else {
      logger.error(`Unknown error with errno=${e.errno} and code=${e.code}\n\tat docs/README.md`);
    }
  }

  return result;
};
