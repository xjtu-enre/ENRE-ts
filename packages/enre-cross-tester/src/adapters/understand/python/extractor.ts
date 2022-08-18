import exec from '../../../common/exec';

export default async (g: string, c: string, ocwd: string) => {
  try {
    const {stdout} = await exec(`upython ${ocwd}/packages/enre-cross-tester/src/adapters/understand/python/extractor.py -p tests/und/${g}/${c}.und null`);
    return stdout;
  } catch (e: any) {
    console.error(e.stdout);
    return false;
  }
};
