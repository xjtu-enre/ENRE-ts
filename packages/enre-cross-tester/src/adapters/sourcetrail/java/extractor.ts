import {readFile} from 'node:fs/promises';
import exec from '../../../common/exec';

export default async (g: string, c: string, ocwd: string) => {
  const cwd = process.cwd();
  try {
    await exec(`python ${ocwd}/packages/enre-cross-tester/src/common/stextractor.py java ${c} ${cwd}/tests/sourcetrail/${g}/${c}/${c}.srctrldb ${cwd}/tests/cases/${g}/${c} ${cwd}/tests/sourcetrail/${g}/ -p`);

    return await readFile(`${cwd}/tests/sourcetrail/${g}/${c}.json`, 'utf-8');
  } catch (e: any) {
    console.error(e);
    return false;
  }
};
