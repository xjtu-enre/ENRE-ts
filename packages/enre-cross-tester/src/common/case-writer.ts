import {CaseContainer} from '@enre-ts/doc-parser';
import {mkdir, readdir, writeFile} from 'fs/promises';
import {dirname} from 'node:path';
import {logger} from '../logger';

export default async (g: string, c: string, {code: cs}: CaseContainer) => {
  if (cs) {
    try {
      await readdir(`tests/cases/_${g}/_${c}`);
    } catch {
      try {
        await mkdir(`tests/cases/_${g}/_${c}`, {recursive: true});
        for (const item of cs) {
          if (item.path.endsWith('/')) {
            await mkdir(`tests/cases/_${g}/_${c}/${item.path}`, {recursive: true});
          } else {
            await mkdir(`tests/cases/_${g}/_${c}/${dirname(item.path)}`, {recursive: true});
            await writeFile(`tests/cases/_${g}/_${c}/${item.path}`, item.content);
          }
        }
      } catch {
        logger.error(`Failed to create dir or write file on tests/cases/_${g}/_${c}`);
        return false;
      }
    }
  }
  return true;
};
