const {promisify} = await import('util');
const exec = promisify((await import('child_process')).exec);

export default test = async (dbpath) => {
  try {
    const {stdout} = await exec(`upython cross/do.py -p ${dbpath} null`);
    return JSON.parse(stdout);
  } catch (e) {
    console.log(e.message);
  }
};
