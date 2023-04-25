import exec from '../../../common/exec';
import {mkdir} from 'fs/promises';

export default async (g: string, c: string, exepath: string, ocwd: string) => {
  const cwd = process.cwd();
  await mkdir(cwd + `/tests/sourcetrail/${g}/${c}`, {recursive: true});

  try {
    // Uncomment following code on demand
    //await exec(`python ${ocwd}/packages/enre-cross-tester/src/common/sthelper.py java ${g} ${c}`);
    await exec(`"${exepath}" index --project-file ${cwd}/tests/sourcetrail/${g}/${c}/${c}.srctrlprj`);
  } catch (e) {
    console.log(e);
    return false;
  }

  return true;
};
