import {spawn} from 'child_process';
import {readdir} from 'node:fs/promises';
import kill from 'tree-kill';

/**
 * [DEPRECATED] To redirect stdout and stderr of the command to the current process.
 * https://stackoverflow.com/a/76309279/13878671
 * Use built-in opts.stdio='inherit' directly.
 *
 * Not using `opts.timeout` because it only the parent process but not all its descendants,
 * https://github.com/nodejs/node/issues/40438
 * use tree-kill instead.
 */
export async function exec(command, {timeout, ...opts}) {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    const childProcess = spawn(cmd, args, {...opts, stdio: 'inherit'});
    let timerID = undefined;
    if (timeout > 0) {
      timerID = setTimeout(function () {
        kill(childProcess.pid);
        reject(new Error('TIMEOUT'));
      }, timeout);
    }

    childProcess.on('error', (error) => {
      if (timerID) clearTimeout(timerID);
      reject(error);
    });
    childProcess.on('exit', (code) => {
      if (timerID) clearTimeout(timerID);
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

export async function readdirNoDS(dir) {
  return (await readdir(dir)).filter(x => x !== '.DS_Store');
}
