import {eGraph, ENREEntityCollectionAll, ENREEntityTypes} from '@enre/container';
import environment from '@enre/environment';
import {warn} from '@enre/logging';
import {analyse} from './analyser';
import {getFileList} from './utils/fileFinder';
import preferences from './utils/preferences';

export default async (
  iPath: string,
  exclude: Array<string> | undefined = undefined
) => {
  // Init global storages


  const fl = await getFileList(iPath, exclude);

  // Suggest multi thread functionality if not enabled
  if (!preferences.get('performance.multi-thread-enabled') && (preferences.get('performance.number-of-processors') > 1)) {
    // info('Multi cores processor detected, running with tag \'-m\' can improve performance significantly');
  }

  if (preferences.get('performance.multi-thread-enabled')) {
    warn('Multi-threading is currently disabled, you have set preference wrong');
    // const sPool = new StaticPool({
    //   size: Math.min(fl.length, preferences.get('performance.number-of-processors')),
    //   task: './src/parser-mt.js'
    // });
    //
    // fl.forEach(record => {
    //   (async () => {
    //     const ast = await sPool.exec(record);
    //   })();
    // });
  } else {
    for (const f in fl) {
      await analyse(fl[f]);
    }

    if (!environment.test) {
      const groupByType = eGraph.all
        .reduce((
          prev: Partial<Record<ENREEntityTypes, Array<ENREEntityCollectionAll>>>,
          curr
        ) => {
          prev[curr.type]?.push(curr) || (prev[curr.type] = [curr]);
          return prev;
        }, {});
      Object.keys(groupByType)
        .forEach(k => console.log(`Entity ${k}: ${groupByType[k as ENREEntityCollectionAll['type']]!.length}`));
    }
  }
};

export {default as preferences} from './utils/preferences';
