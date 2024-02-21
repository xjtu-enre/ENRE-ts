import {spawn} from 'child_process';

/**
 * To redirect stdout and stderr of the command to the current process.
 *
 * https://stackoverflow.com/a/76309279/13878671
 */
export async function exec(command, opts) {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    const childProcess = spawn(cmd, args, opts);
    childProcess.stdout.on('data', (data) => {
      process.stdout.write(data.toString());
    });
    childProcess.stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });
    childProcess.on('error', (error) => {
      reject(error);
    });
    childProcess.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command exited with code ${code}.`));
      }
    });
  });
}

const {promisify} = await import('util');
const nodeExec = promisify((await import('child_process')).exec);
export {nodeExec};

export function currTimestamp() {
  return (new Date()).toISOString().replace(/[^0-9]/g, '').slice(0, -3);
}
