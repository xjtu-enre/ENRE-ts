import {getFileContent, getFileList} from './utils/fileResolver';
import global from './utils/global';
import {errorAndExit, info} from './utils/cliRender';
import {Worker} from 'worker_threads';
import {StaticPool} from 'node-worker-threads-pool';
import {analyse} from './analyser';
import {ENREEntityCollectionAll} from './analyser/entities';

export const usingCore = async (
  iPath: string,
  exclude: Array<string> | undefined) => {

  const fl = await getFileList(iPath, exclude);

  // Suggest multi thread functionality if not enabled
  if (!global.isMultiThreadEnabled && (global.NUMBER_OF_PROCESSORS > 1)) {
    // info('Multi cores processor detected, running with tag \'-m\' can improve performance significantly');
  }

  if (global.isMultiThreadEnabled) {
    const sPool = new StaticPool({
      size: Math.min(fl.length, global.NUMBER_OF_PROCESSORS),
      task: './core/parser-mt.js'
    });

    fl.forEach(record => {
      (async () => {
        const ast = await sPool.exec(record);
      })();
    });
  } else {
    for (const f in fl) {
      await analyse(fl[f]);
    }

    const groupByType = global.eContainer.all
      .reduce((
        prev: Partial<Record<ENREEntityCollectionAll['type'], Array<ENREEntityCollectionAll>>>,
        curr
      ) => {
        prev[curr.type]?.push(curr) || (prev[curr.type] = [curr]);
        return prev;
      }, {});
    Object.keys(groupByType)
      .forEach(k => console.log(`Entity ${k}: ${groupByType[k as ENREEntityCollectionAll['type']]!.length}`));
  }
};
