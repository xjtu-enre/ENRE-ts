import exec from '../../../common/exec';
import {mkdir} from 'fs/promises';

export default async (g: string, c: string, exepath: string) => {
  const ocwd = process.cwd();
  await mkdir(ocwd + `/tests/enre/${g}/${c}`, {recursive: true});
  process.chdir(ocwd + `/tests/enre/${g}/${c}`);
  try {
    await exec(`java -jar ${exepath} ${ocwd}/tests/cases/_${g}/_${c} ${c}`);
  } catch (e: any) {
    console.log(e);
    return false;
  } finally {
    process.chdir(ocwd);
  }

  return true;
};
