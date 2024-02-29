/**
 * This script expects:
 *
 * 1. The CWD to be this containing src directory;
 * 2. The command `sparrow` to be available in the PATH;
 * 3. Git config `uploadpack.allowReachableSHA1InWant` is set to true;
 *    (Ref: https://stackoverflow.com/a/43136160/13878671)
 * 4. Manually create `../logs` directory;
 * 5. `npm install` dependencies;
 *    (To use cloc, perl should be installed)
 */

import {Command, Option} from 'commander';
import {copyFile, mkdir, readdir, readFile, rm} from 'node:fs/promises';
import {createReadStream} from 'fs';
import {parse} from 'csv-parse';
import {parse as parseSync} from 'csv-parse/sync';
import {stringify} from 'csv-stringify';
import path from 'node:path';
import postProcess from './post-process/index.js';
import {currTimestamp, exec, nodeExec} from './utils.js';
import stat from './stat.js';
import {createWriteStream} from 'node:fs';

const LIST_FILE_PATH = '../repo-list/240221.csv';

const cli = new Command();

cli.command('stat')
  .description('Print fixture statistics and extract test cases')
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
  .description('Gather all Godel scripts to \'lib\' dir and inject custom Godel lib file to Sparrow and rebuild it')
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
        const destName = script.split('/').pop().substring(4);

        // Temporarily disable slow query
        if (['all-export-declarations.gdl', 'all-object-creation.gdl'].includes(destName)) {
          continue;
        }

        await copyFile(script, `../lib/${destName}`);
      }
    }

    console.log('Copying custom lib file and rebuild Sparrow');
    // stdout ends with '\n'
    const {stdout} = await nodeExec('which sparrow');
    await copyFile('../fixtures/_utils/Enrets.gdl', path.join(stdout.slice(0, -2), '../lib-script/coref/javascript/Enrets.gdl'));
    await exec('sparrow rebuild lib -lang javascript');
  });

function parseArrayInt(value, previous) {
  return (previous ?? []).concat(parseInt(value, 10));
}

cli.command('fetch-repo')
  .argument('<dir>', 'The base dir where cloned repos are stored')
  .description('Clone repos from GitHub using the pre-specified repo list csv file')
  .addOption(new Option('-s --start <start>', 'Start repo count (started from 1)').argParser(value => parseInt(value, 10)).default(1))
  .addOption(new Option('-e --end <end>', 'End repo count (included)').argParser(parseInt))
  .addOption(new Option('-d --depth <depth>', 'Git clone depth').argParser(parseInt).default(1))
  .addOption(new Option('-c --commits <commits...>', 'Commit indices to checkout, available values are from 0 to 4').argParser(parseArrayInt))
  .action(async (dir, opts) => {
    const csvRead = createReadStream(LIST_FILE_PATH)
      .pipe(parse({
        from: opts.start,
        columns: true,
      }));

    let count = 0;
    for await (const repo of csvRead) {
      if (opts.end && opts.start + count === opts.end + 1) {
        break;
      }

      console.log(`Cloning ${repo.name} in count ${opts.start + count}`);
      try {
        await exec(`git clone https://github.com/${repo.name} --depth=${opts.depth}`, {
          cwd: dir,
        });
      } catch (e) {
        if (e.message === 'Command exited with code 128.') {
          console.log(`Repo ${repo.name} already exists`);
        }
      }
      count += 1;

      const repoSimpleName = repo.name.split('/')[1];
      // Fetching specified commits
      for (const commitIndex of opts.commits) {
        const csvKey = `commit_-${(commitIndex * 0.5).toFixed(1)}Y`;
        const commitSHA = repo[csvKey];

        if (commitSHA !== '') {
          console.log(`Fetching ${csvKey} ${commitSHA} for repo ${repo.name}`);
          await exec(`git fetch --depth=1 origin ${commitSHA}`, {
            cwd: path.join(dir, repoSimpleName),
          });
        }
      }
    }
  });

export async function getRepoAndCommits({start, end, commits}) {
  const csv = parseSync(await readFile(LIST_FILE_PATH), {columns: true});
  const returned = {};

  for (const [index, repo] of csv.entries()) {
    if (index + 1 < start || (end && index >= end)) {
      continue;
    }

    const simpleName = repo.name.split('/')[1];
    // Remove redundant commits
    returned[simpleName] = [
      ...new Set(
        commits.map(i => repo[`commit_-${(i * 0.5).toFixed(1)}Y`])
      )
    ].filter(x => x !== '');
  }

  return returned;
}

cli.command('create-db')
  .description('Create Sparrow DB for each repo in the given dir')
  .argument('<repo-dir>', 'The base dir where cloned repos are stored')
  .argument('<db-dir>', 'The base dir where dbs are stored')
  .addOption(new Option('-s --start <start>', 'Start repo count').argParser(value => parseInt(value, 10)).default(1))
  .addOption(new Option('-e --end <end>', 'End repo count').argParser(parseInt))
  .addOption(new Option('-c --commits <commits...>', 'Commit indices to work on').argParser(parseArrayInt))
  .action(async (repoDir, dbDir, opts) => {
    const csvWrite = stringify({
      header: true, columns: [
        // repo@commit
        'name',
        // in seconds
        'db_creation_duration',
      ]
    });
    csvWrite.pipe(createWriteStream(`../logs/${currTimestamp()}-db.csv`));

    const repoCommitMap = await getRepoAndCommits(opts);

    const repos = (await readdir(repoDir)).filter(x => x !== '.DS_Store');
    const dbs = (await readdir(dbDir)).filter(x => x !== '.DS_Store');

    for (const repo of repos) {
      // If the existing repo is not in the list, skip
      if (!Object.keys(repoCommitMap).includes(repo)) {
        continue;
      }

      // repoCommitMap already filtered out unspecified commits
      for (const commit of repoCommitMap[repo]) {
        const name = repo + '@' + commit;

        if (dbs.includes(name)) {
          console.log(`Sparrow db of ${name} already exists, skipped`);
          continue;
        }

        console.log(`Creating sparrow db of ${name}`);
        await exec(`git checkout ${commit} -f`, {cwd: path.join(repoDir, repo)});

        try {
          const startTime = Date.now();
          await exec(`sparrow database create --data-language-type=javascript -s ${path.join(repoDir, repo)} -o ${path.join(dbDir, name)}`);
          const endTime = Date.now();

          csvWrite.write({
            name: name,
            db_creation_duration: ((endTime - startTime) / 1000).toFixed(2),
          });
        } catch (e) {
          if (e.message === 'Command exited with code 1.') {
            csvWrite.write({
              name: name,
              db_creation_duration: 'FAILED',
            });
          }
        }
      }
    }
  });

cli.command('check')
  .description('Check the data integrity of repos and dbs')
  .argument('<repo-dir>', 'The base dir where cloned repos are stored')
  .argument('<db-dir>', 'The base dir where dbs are stored')
  .addOption(new Option('-s --start <start>', 'Start repo count').argParser(value => parseInt(value, 10)).default(1))
  .addOption(new Option('-e --end <end>', 'End repo count').argParser(parseInt))
  .addOption(new Option('-o --operation', 'Perform corresponding operation based on data type').default(false))
  .action(async (repoDir, dbDir, opts) => {
    const repoCommitMap = await getRepoAndCommits({
      start: opts.start,
      end: opts.end,
      // Force check all commits
      commits: [0, 1, 2, 3, 4],
    });

    const repos = (await readdir(repoDir)).filter(x => x !== '.DS_Store');
    const dbs = (await readdir(dbDir)).filter(x => x !== '.DS_Store');

    let
      totalRepoCount = 0,
      clonedRepoCount = 0,
      unfinishedRepoCount = 0,
      totalCommitCount = 0,
      processedCommitCount = 0;
    for (const [repo, commits] of Object.entries(repoCommitMap)) {
      totalRepoCount += 1;

      if (!repos.includes(repo)) {
        console.log(`Missing cloned repo (${totalRepoCount}) '${repo}'`);
        continue;
      }

      clonedRepoCount += 1;

      let unfinishedRepo = false;
      for (const commit of commits) {
        totalCommitCount += 1;

        const name = repo + '@' + commit;
        if (!dbs.includes(name)) {
          console.log(`Missing DB '${name}'`);
          unfinishedRepo = true;
          continue;
        }

        processedCommitCount += 1;

        const dbContent = await readdir(path.join(dbDir, name));

        if (dbContent.includes('tmp')) {
          console.log(`Unfinished DB '${name}'`);

          if (opts.operation) {
            console.log('\tDeleting...');
            await rm(path.join(dbDir, name), {recursive: true, force: true});
          }
        }
      }

      if (unfinishedRepo) {
        unfinishedRepoCount += 1;
      }
    }

    console.log(`\nRepo Cloned: ${clonedRepoCount}/${totalRepoCount}`);
    console.log(`Repo Finished: ${clonedRepoCount - unfinishedRepoCount}/${clonedRepoCount} (-${unfinishedRepoCount})`);
    console.log(`Commit Finished: ${processedCommitCount}/${totalCommitCount} (-${totalCommitCount - processedCommitCount})`);
  });

cli.command('calc-loc')
  .description('Calculate LoC of each repo in the given dir and save to its db directory')
  .argument('<repo-dir>', 'The base dir where cloned repos are stored')
  .argument('<db-dir>', 'The base dir where dbs are stored')
  .addOption(new Option('-s --start <start>', 'Start repo count').argParser(value => parseInt(value, 10)).default(1))
  .addOption(new Option('-e --end <end>', 'End repo count').argParser(parseInt))
  .addOption(new Option('-c --commits <commits...>', 'Commit indices to work on').argParser(parseArrayInt))
  .addOption(new Option('-o --override', 'Override existing results').default(false))
  .action(async (repoDir, dbDir, opts) => {
    const repoCommitMap = await getRepoAndCommits(opts);

    const repos = (await readdir(repoDir)).filter(x => x !== '.DS_Store');
    const dbs = (await readdir(dbDir)).filter(x => x !== '.DS_Store');

    for (const [repo, commits] of Object.entries(repoCommitMap)) {
      if (!repos.includes(repo)) {
        console.log(`Repo '${repo}' not found in the given directory, skipped`);
        continue;
      }

      for (const commit of commits) {
        const name = repo + '@' + commit;
        if (!dbs.includes(name)) {
          console.log(`DB '${name}' not found in the given directory, skipped`);
          continue;
        }

        const dbPath = path.join(dbDir, name);

        const existing = await readdir(dbPath);

        if (!opts.override) {
          if (existing.includes('loc.json')) {
            console.log(`LoC result already exists for DB '${name}', skipped`);
            continue;
          }
        }

        console.log(`Calculating LoC for DB '${name}'`);
        await exec(`git checkout ${commit} -f`, {cwd: path.join(repoDir, repo)});

        try {
          await exec(`npx cloc --include-lang=javascript,jsx,typescript --json --out=${path.join(dbPath, 'loc.json')} ${path.join(repoDir, repo)}`);
        } catch (e) {
          console.log(`Failed to calculate LoC for DB '${name}'`);
        }
      }
    }
  });

cli.command('run-godel')
  .description('Run Godel scripts on each db in the given dir\nThis command requires \'gather\' command to be manually executed first')
  .argument('<db-dir>', 'The base dir where dbs are stored')
  .addOption(new Option('-s --start <start>', 'Start repo count').argParser(value => parseInt(value, 10)).default(1))
  .addOption(new Option('-e --end <end>', 'End repo count').argParser(parseInt))
  .addOption(new Option('-c --commits <commits...>', 'Commit indices to work on').argParser(parseArrayInt))
  .addOption(new Option('-t --timeout <timeout>', 'Timeout (in minute) for each Godel script').argParser(parseInt).default(10))
  .addOption(new Option('-o --override', 'Override existing godel results').default(false))
  .action(async (dbDir, opts) => {
    const scripts = (await readdir('../lib')).filter(x => x !== '.DS_Store');
    const dbs = (await readdir(dbDir)).filter(x => x !== '.DS_Store');

    const repoCommitMap = await getRepoAndCommits(opts);

    const csvWrite = stringify({
      header: true, columns: [
        // repo@commit
        'name',
        // in seconds (each script)
        ...scripts,
      ]
    });
    csvWrite.pipe(createWriteStream(`../logs/${currTimestamp()}-gdl.csv`));

    for (const db of dbs) {
      const [repo, commit] = db.split('@');

      if (!Object.keys(repoCommitMap).includes(repo) || !repoCommitMap[repo].includes(commit)) {
        continue;
      }

      const dbPath = path.resolve(dbDir, db);

      const log = {
        name: db,
      };
      const writeLogAndExit = () => {
        csvWrite.write(log);
        process.exit(1);
      };
      // Save produced logs when forced to exit to prevent data loss
      process.on('SIGINT', writeLogAndExit);

      const existing = await readdir(dbPath);

      for (const script of scripts) {
        if (!opts.override) {
          const resultName = script.replace('.gdl', '.json');
          if (existing.includes(resultName)) {
            console.log(`Godel result '${resultName}' already exists for DB '${db}', skipped`);
            continue;
          }
        }

        console.log(`Running Godel script '${script}' on DB '${db}'`);
        const scriptPath = path.resolve(process.cwd(), '../lib', script);

        try {
          const startTime = Date.now();
          await exec(
            `sparrow query run --format json --database ${dbPath} --gdl ${scriptPath} --output ${dbPath}`,
            {timeout: opts.timeout * 60 * 1000},
          );
          const endTime = Date.now();

          log[script] = ((endTime - startTime) / 1000).toFixed(2);
        } catch (e) {
          console.error(`Failed to run Godel script '${script}' on DB '${db}'`);

          log[script] = 'N/A';
        }
      }

      csvWrite.write(log);
      // Remove old log listener to prevent accumulating all previous logs
      process.removeListener('SIGINT', writeLogAndExit);
    }
  });

cli.command('post-process')
  .description('Invoke post process JS scripts to process Godel\'s output and generate final metric results')
  .argument('<db-dir>', 'The base dir where dbs are stored')
  .addOption(new Option('-s --start <start>', 'Start repo count').argParser(value => parseInt(value, 10)).default(1))
  .addOption(new Option('-e --end <end>', 'End repo count').argParser(parseInt))
  .addOption(new Option('-c --commits <commits...>', 'Commit indices to work on').argParser(parseArrayInt))
  .action(postProcess);

cli.parse(process.argv);
