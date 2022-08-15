import exec from '../../../common/exec';

export default async (g: string, c: string,) => {
  try {
    const {stdout} = await exec(`upython packages/enre-cross-tester/src/adapters/understand/ts/extractor.py -p tests/und/${g}/${c}.und null`);
    return stdout;
  } catch (e: any) {
    console.error(e.stdout);
    return false;
  }
};
