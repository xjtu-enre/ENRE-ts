import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import loadData from './load-data.js';
import stat from '../stat.js';
import {getRepoAndCommits} from '../cli.js';
import {readdirNoDS} from '../utils.js';

export default async function (dbDir, opts) {
  const dbs = await readdirNoDS(dbDir);

  const repoCommitMap = await getRepoAndCommits(opts);

  const fixtures = await stat(true);
  let implementedFeatures = {};
  const readGroup = opts.groups?.map(g => g.split('/')[0]);
  const readFeature = opts.groups?.map(g => g.split('/')[1]);
  Object.keys(fixtures).forEach(group => {
    if (opts.groups?.length > 0 && !readGroup.includes(group)) {
      return;
    }

    Object.keys(fixtures[group]).forEach(feature => {
      if ((!opts.groups || !readFeature || readFeature.includes(feature)) && fixtures[group][feature].hasPostScript) {
        implementedFeatures[`${group}/${feature}`] = undefined;
      }
    });
  });

  await Promise.all(Object.keys(implementedFeatures).map(async fPath =>
    implementedFeatures[fPath] = (await import(path.join('../../fixtures', fPath, 'index.js'))).default
  ));
  const dataToLoad = new Set();
  Object.values(implementedFeatures).forEach(feat => feat.dependencies.forEach(dep => dataToLoad.add(dep)));

  console.log(`Loaded ${Object.keys(implementedFeatures).length} features.`);

  const alldbCount = dbs.length;
  let dbCount = 0;
  for (const [repo, commits] of Object.entries(repoCommitMap)) {
    for (const commit of commits) {
      const db = `${repo}@${commit}`;

      if (!dbs.includes(db)) {
        console.warn(`DB '${db}' does not exist in the directory, skipped.`);
        continue;
      }

      dbCount += 1;
      console.log(`\n(${dbCount} / ${alldbCount}) Processing repo '${db}'...`);

      const allData = await loadData(path.join(dbDir, db), [...dataToLoad]);
      const dataKeys = Object.keys(allData);

      let allResults = {};

      iterFeat: for (const [key, feat] of Object.entries(implementedFeatures)) {
        if (feat.dependencies && feat.dependencies.length > 0 && feat.process) {
          for (const dep of feat.dependencies) {
            if (!dataKeys.includes(dep)) {
              console.warn(`\tThe required dependency data source '${dep}' of feature '${key}' does not exist in repo '${db}', this feature is ignored.`);
              continue iterFeat;
            }
          }

          console.log(`\tInvoking feature '${key}'...`);
          // Default disable trace mode
          allResults[key] = await feat.process(...[...feat.dependencies.map(dep => allData[dep]), false]);
        }
      }

      const resPath = path.join(dbDir, db, 'results.json');
      let resContent = undefined;
      try {
        if (!opts.merge) {
          resContent = allResults;
        } else {
          const content = JSON.parse(await readFile(resPath, 'utf8'));
          resContent = {...content, ...allResults};
        }
      } catch (e) {
        // results.json does not exist, no matter override or not
        resContent = allResults;
      } finally {
        await writeFile(resPath, JSON.stringify(resContent, null, 2));
      }
    }
  }
}
