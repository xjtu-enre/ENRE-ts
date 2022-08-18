import {CaseContainer} from '@enre/doc-parser';
import {mkdir, readdir, writeFile} from 'fs/promises';
import {dirname} from 'node:path';
import {warn} from '@enre/logging';

export default async (g: string, c: string, {code: cs}: CaseContainer) => {
  try {
    await readdir(`tests/cases/_${g}/_${c}`);
  } catch {
    try {
      await mkdir(`tests/cases/_${g}/_${c}`, {recursive: true});
      for (const item of cs) {
        await mkdir(`tests/cases/_${g}/_${c}/${dirname(item.path)}`, {recursive: true});
        await writeFile(`tests/cases/_${g}/_${c}/${item.path}`, item.content);
      }
    } catch {
      warn(`Failed to create dir or write file on tests/cases/_${g}/_${c}`);
      return false;
    }
  }
  return true;
};
