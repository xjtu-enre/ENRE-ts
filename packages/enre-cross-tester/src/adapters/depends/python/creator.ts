import exec from '../../../common/exec';
import {mkdir} from 'fs/promises';

export default async (g: string, c: string, exepath: string) => {
  const ocwd = process.cwd();
  await mkdir(ocwd + `/tests/depends/${g}/${c}`, {recursive: true});
  process.chdir(ocwd + `/tests/depends/${g}/${c}`);
  try {
    await exec(`java -jar ${exepath} python ${ocwd}/tests/cases/_${g}/_${c} ${c} -g var`);
  } catch {
    return false;
  } finally {
    process.chdir(ocwd);
  }

  return true;
};
