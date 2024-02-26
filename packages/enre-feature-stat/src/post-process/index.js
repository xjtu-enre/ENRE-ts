import {readdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import loadData from './load-data.js';
import stat from '../stat.js';
import {getRepoAndCommits} from '../cli.js';

export default async function (dbDir, opts) {
  const dbs = (await readdir(dbDir)).filter(x => x !== '.DS_Store');

  const repoCommitMap = await getRepoAndCommits(opts);

  const fixtures = await stat();
  let implementedFeatures = {};
  Object.keys(fixtures).forEach(group => {
    Object.keys(fixtures[group]).forEach(feature => {
      if (fixtures[group][feature].hasPostScript) {
        implementedFeatures[`${group}/${feature}`] = undefined;
      }
    });
  });

  await Promise.all(Object.keys(implementedFeatures).map(async fPath =>
    implementedFeatures[fPath] = (await import(path.join('../../fixtures', fPath, 'index.js'))).default
  ));

  console.log(`Loaded ${Object.keys(implementedFeatures).length} features.`);

  for (const db of dbs) {
    const [repo, commit] = db.split('@');
    if (!Object.keys(repoCommitMap).includes(repo) || !repoCommitMap[repo].includes(commit)) {
      continue;
    }

    console.log(`\nProcessing repo '${db}'...`);

    const allData = await loadData(path.join(dbDir, db));
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
        const result = await feat.process(...feat.dependencies.map(dep => allData[dep]));

        for (const resKey of Object.keys(result)) {
          if (Object.keys(allResults).includes(resKey)) {
            throw `\tThe result key '${resKey}' of feature '${key}' already exists in repo '${db}', expect unique key.`;
          }
        }

        allResults = {...allResults, ...result};
      }
    }

    await writeFile(path.join(dbDir, db, 'results.json'), JSON.stringify(allResults, null, 2));
  }
}
