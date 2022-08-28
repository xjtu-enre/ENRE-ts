import {
  eGraph,
  ENREEntityCollectionAll,
  ENREEntityFile,
  ENREEntityTypes,
  ENRERelationCollectionAll,
  ENRERelationTypes,
  recordEntityFile,
  rGraph
} from '@enre/container';
import environment from '@enre/environment';
import {warn} from '@enre/logging';
import path from 'path';
import {analyse} from './analyser';
import linker from './analyser/linker';
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
    /**
     * PRE PASS: Create file entities for every entry.
     * TODO: Remove this when dedicated package & file extractor is done.
     */
    for (const f of fl) {
      recordEntityFile(
        path.basename(f),
        [path.dirname(f)],
        // TODO: sourceType detect
        'module',
        // TODO: Migrate lang to ts enum
        path.extname(f).includes('ts') ? 'ts' : 'js');
    }

    /**
     * FIRST PASS: Extract entities and immediate relations, build entity graph.
     */
    for (const f of eGraph.where({type: 'file'})) {
      await analyse(f as ENREEntityFile);
    }

    /**
     * SECOND PASS: Work on pseudo relation container to link string into
     * correlated entity object.
     */
    linker();

    if (!environment.test) {
      const groupingEntities = eGraph.all
        .reduce((
          prev: Partial<Record<ENREEntityTypes, Array<ENREEntityCollectionAll>>>,
          curr
        ) => {
          prev[curr.type]?.push(curr) || (prev[curr.type] = [curr]);
          return prev;
        }, {});
      Object.keys(groupingEntities)
        .forEach(k => console.log(`Entity ${k}: ${groupingEntities[k as ENREEntityCollectionAll['type']]!.length}`));

      const groupingRelations = rGraph.all
        .reduce((
          prev: Partial<Record<ENRERelationTypes, Array<ENRERelationCollectionAll>>>,
          curr
        ) => {
          prev[curr.type]?.push(curr) || (prev[curr.type] = [curr]);
          return prev;
        }, {});
      Object.keys(groupingRelations)
        .forEach(k => console.log(`Relation ${k}: ${groupingRelations[k as ENRERelationCollectionAll['type']]!.length}`));
    }
  }
};

export {default as preferences} from './utils/preferences';
export {cleanAnalysis} from './analyser';
