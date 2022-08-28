import exec from '../../../common/exec';
import {readFile} from 'node:fs/promises';

export default async (g: string, c: string, ocwd: string) => {
  try {
    await exec(`upython ${ocwd}/packages/enre-cross-tester/src/adapters/understand/ts/extractor.py tests/und/${g}/${c}.und tests/und/${g}/${c}.json`);
    return await readFile(`tests/und/${g}/${c}.json`, 'utf-8');
  } catch (e: any) {
    console.error(e.stdout);
    return false;
  }
};
