import exec from '../../common/exec';

export default async () => {
  try {
    const {stdout} = await exec('upython -V');
    if (!/Python 3\.\d+\.\d+/.test(stdout)) return false;
  } catch (e) {
    return false;
  }

  try {
    const {stdout} = await exec('und version');
    return /\(Build [0-9]+\)/.test(stdout);
  } catch (e) {
    return false;
  }
};
