const {promisify} = await import('util');
const exec = promisify((await import('child_process')).exec);

export default exec;
