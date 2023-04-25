import {readFile} from 'node:fs/promises';

export default async (g: string, c: string, ocwd: string) => {
  try {
    return await readFile(`${process.cwd()}/tests/depends/${g}/${c}/${c}.json`, 'utf-8');
  } catch (e: any) {
    console.error(e);
    return false;
  }
};
