import exec from '../../../common/exec';

export default async (g: string, c: string,) => {
  try {
    console.log(`und create -db tests/und/${g}/${c}.und -languages Python add ${process.cwd()}/tests/cases/_${g}/_${c} analyze -all`);
  } catch {
    return false;
  }

  return true;
};
