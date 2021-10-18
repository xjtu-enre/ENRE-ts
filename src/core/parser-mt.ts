import {parentPort} from 'worker_threads';
import {errorAndExit} from './utils/cliRender';
import {getFileContent} from './utils/fileResolver';

// WARNING: This file must be run under a worker_thread instance

if (!parentPort) {
  errorAndExit('Parser is not running under a worker_thread instance');
}

// @ts-ignore
parentPort.on('message', async msg => {
  console.log(msg);
  // @ts-ignore
  parentPort.postMessage('done');
});
