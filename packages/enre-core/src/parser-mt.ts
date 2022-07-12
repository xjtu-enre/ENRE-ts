import {parentPort} from 'worker_threads';
import {panic} from '@enre/logging';

// WARNING: This file must be run under a worker_thread instance

if (!parentPort) {
  panic('Parser is not running under a worker_thread instance');
}

// @ts-ignore
parentPort.on('message', async msg => {
  console.log(msg);
  // @ts-ignore
  parentPort.postMessage('done');
});
