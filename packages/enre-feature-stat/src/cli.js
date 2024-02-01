/**
 * This script expects:
 *
 * 1. The CWD to be this containing src directory;
 * 2. The command `sparrow` to be available in the PATH.
 */

import {Command, Option} from 'commander';
import {copyFile, mkdir, readdir, rm} from 'node:fs/promises';
import {createReadStream} from 'fs';
import {parse} from 'csv-parse';
import path from 'node:path';
import postProcess from './post-process/index.js';
import exec, {nodeExec} from './exec.js';
import stat from './stat.js';

const cli = new Command();

cli.command('stat')
  .description('Print statistics')
  .action(async () => {
    const fixtures = await stat();

    // Data print
    let
      featureCount = 0,
      metricCount = 0,
      featureQueryableCount = 0,
      featureImplementedCount = 0,
      featureIgnoredCount = 0,
      actualGdlScriptCount = 1; // Manually add `_utils/Enrets.gdl` to the count

    Object.keys(fixtures)
      .sort((a, b) => a < b)
      .forEach(fixtureGroup => {
        actualGdlScriptCount += fixtures[fixtureGroup].gdls.filter(gdl => gdl.startsWith('get')).length;

        Object.keys(fixtures[fixtureGroup])
          .sort((a, b) => a < b)
          .forEach(fixtureFeature => {
            if (fixtureFeature === 'gdls') return;

            const obj = fixtures[fixtureGroup][fixtureFeature];
            console.log(`${fixtureGroup}\t${fixtureFeature}\tMetricsCount: ${obj['metrics'].length}\tGodel: ${obj['gdls'].length > 0}\tProcess: ${obj['hasPostScript']}`);

            featureCount += 1;
            metricCount += obj['metrics'].length;

            obj.gdls.forEach(gdl => {
              featureQueryableCount += 1;
              if (gdl.startsWith('get')) {
                actualGdlScriptCount += 1;
              } else if (gdl.startsWith('use')) {
                /* ... */
              } else if (gdl.startsWith('ignore')) {
                featureQueryableCount -= 1;
                featureIgnoredCount += 1;
              }
            });

            if (obj['hasPostScript']) {
              featureImplementedCount += 1;
            }
          });
      });

    console.log('\n');
    console.log(`Total features: ${featureCount}`);
    // console.log(`Total metrics: ${metricCount}`);
    console.log(`Ignored features: ${featureIgnoredCount}`);
    console.log(`Queryable features: ${featureQueryableCount}`);
    console.log(`Implemented features: ${featureImplementedCount}`);
    console.log(`Wrote Godel scripts: ${actualGdlScriptCount}`);
    console.log(`WIP features: (Query)${featureCount - featureQueryableCount - featureIgnoredCount} (Process)${featureCount - featureImplementedCount - featureIgnoredCount}`);
  });

cli.command('gather')
  .description('Gather all Godel scripts')
  .action(async () => {
    const scripts = [];

    for await (const fixtureGroup of await readdir('../fixtures')) {
      if (fixtureGroup.startsWith('_')) continue;

      for await (const fixtureFeature of await readdir(`../fixtures/${fixtureGroup}`)) {
        if (fixtureFeature.endsWith('.gdl') && fixtureFeature.startsWith('get')) {
          scripts.push(`../fixtures/${fixtureGroup}/${fixtureFeature}`);
        } else {
          for await (const fName of await readdir(`../fixtures/${fixtureGroup}/${fixtureFeature}`)) {
            if (fName.endsWith('.gdl') && fName.startsWith('get')) {
              scripts.push(`../fixtures/${fixtureGroup}/${fixtureFeature}/${fName}`);
            }
          }
        }
      }
    }

    try {
      await rm('../lib', {recursive: true});
    } catch {
      /* Do noting */
    } finally {
      await mkdir('../lib');

      for await (const script of scripts) {
        // Remove the `get-` prefix from the file name
        await copyFile(script, `../lib/${script.split('/').pop().substring(4)}`);
      }
    }

    console.log('Copying custom lib file and rebuild Sparrow');
    const {stdout} = await nodeExec('which sparrow');
    await copyFile('../fixtures/_utils/Enrets.gdl', path.join(stdout, '/lib-script/coref/javascript/Enrets.gdl'));
    await exec('sparrow rebuild lib -lang javascript');
  });

cli.command('fetch-repo')
  .argument('<dir>', 'The base dir where cloned repos are stored')
  .description('Fetch repos from GitHub')
  .addOption(new Option('-s --start <start>', 'Start index').argParser(parseInt).default(0))
  .addOption(new Option('-e --end <end>', 'End repo index').argParser(parseInt))
  .addOption(new Option('-d --depth <depth>', 'Git clone depth').argParser(parseInt).default(1))
  .action(async (dir, opts) => {
    const csvRead = createReadStream('../repo-list/240130.csv')
      .pipe(parse({
        from: opts.start,
        columns: true,
      }));

    let count = 0;
    for await (const repo of csvRead) {
      if (opts.end && opts.start + count === opts.end) {
        break;
      }

      console.log(`Cloning ${repo.name} in index ${opts.start + count}`);
      await exec(`git clone https://github.com/${repo.name} --depth=${opts.depth}`, {
        cwd: dir,
      });

      count += 1;
    }
  });

cli.command('create-db')
  .argument('<repo-dir>', 'The base dir where cloned repos are stored')
  .argument('<db-dir>', 'The base dir where dbs are stored')
  .action(async (repoDir, dbDir) => {
    const repos = (await readdir(repoDir)).filter(x => x !== '.DS_Store');
    const dbs = (await readdir(dbDir)).filter(x => x !== '.DS_Store');

    for (const repo of repos) {
      if (dbs.includes(repo)) {
        console.log(`Sparrow db of '${repo}' already exists, skipped`);
        continue;
      }

      console.log(`Creating sparrow db of '${repo}'`);
      await exec(`sparrow database create --data-language-type=javascript -s ${path.join(repoDir, repo)} -o ${path.join(dbDir, repo)}`);
    }
  });

cli.command('run-godel')
  .argument('<db-dir>', 'The base dir where dbs are stored')
  .action(async (dbDir) => {
    const scripts = (await readdir('../lib')).filter(x => x !== '.DS_Store');
    const dbs = (await readdir(dbDir)).filter(x => x !== '.DS_Store');

    for (const db of dbs) {
      const dbPath = path.resolve(dbDir, db);

      for (const script of scripts) {
        console.log(`Running Godel script '${script}' on DB '${db}'`);
        const scriptPath = path.resolve(process.cwd(), '../lib', script);

        try {
          await exec(`sparrow query run --format json --database ${dbPath} --gdl ${scriptPath} --output ${dbPath}`);
        } catch (e) {
          console.error(`Failed to run Godel script '${script}' on DB '${db}'`);
        }
      }
    }
  });

cli.command('post-process')
  .argument('<db-dir>', 'The base dir where dbs are stored')
  .action(postProcess);

cli.parse(process.argv);
