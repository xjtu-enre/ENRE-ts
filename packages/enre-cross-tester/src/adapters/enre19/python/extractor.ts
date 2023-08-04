import {readFile} from 'node:fs/promises';

export default async (g: string, c: string, ocwd: string) => {
  return {
    entities: await readFile(`${process.cwd()}/tests/enre-old/${g}/${c}-out/${c}_node.csv`, 'utf-8'),
    relations: await readFile(`${process.cwd()}/tests/enre-old/${g}/${c}-out/${c}_edge.csv`, 'utf-8'),
  };
};
