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
import {copyFile, mkdir, readFile, rm, stat as fsstat, writeFile} from 'node:fs/promises';
import {createReadStream} from 'fs';
import {parse} from 'csv-parse';
import {parse as parseSync} from 'csv-parse/sync';
import {stringify} from 'csv-stringify';
import path from 'node:path';
import postProcess from './post-process/index.js';
import {currTimestamp, exec, nodeExec, readdirNoDS} from './utils.js';
import stat from './stat.js';
import {createWriteStream} from 'node:fs';
import trace from './post-process/trace.js';
import seed from 'seed-random';
import GODELMETA from './godel-meta.js';
import {groupCountBy} from '../fixtures/_utils/post-process.js';
import {filter} from './post-process/load-data.js';

const LIST_FILE_PATH = '../repo-list/240221.csv';

const cli = new Command();

cli.command('stat')
  .description('Print fixture statistics and extract test cases')
  .addOption(new Option('--wip', 'Prints info for WIP features only'))
  .addOption(new Option('--no-ignored', 'Do not print ignored features'))
  .action(async (opts) => {
    const fixtures = await stat();

    // Data print
    let
      featureCount = 0,
      metricCount = 0,
      unitTestCount = {},
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
            const hasGodel = obj['gdls'].length > 0;
            const hasScript = obj['hasPostScript'];
            if (!opts.wip || (!hasGodel || !hasScript)) {
              if (opts.ignored || !obj.isIgnored) {
                console.log(`${fixtureGroup}\t${fixtureFeature}` + (obj.isIgnored ? ' [Ignored]' : ''));
                console.log(`\tMetricsCount: ${obj['metrics'].length}\tGodel: ${hasGodel}\tProcess: ${hasScript}`);
              }
            }

            featureCount += 1;
            metricCount += obj['metrics'].length;
            unitTestCount[fixtureGroup] ??= 0;
            unitTestCount[fixtureGroup] += obj.unitTests;

            if (obj.isIgnored) {
              featureIgnoredCount += 1;
              return;
            }

            if (hasGodel) {
              featureQueryableCount += 1;
            }

            obj.gdls.forEach(gdl => {
              if (gdl.startsWith('get')) {
                actualGdlScriptCount += 1;
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
    console.log(`Total unit tests: ${JSON.stringify(unitTestCount)}`);
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

    for await (const fixtureGroup of await readdirNoDS('../fixtures')) {
      if (fixtureGroup.startsWith('_')) continue;

      for await (const fixtureFeature of await readdirNoDS(`../fixtures/${fixtureGroup}`)) {
        if (fixtureFeature.endsWith('.gdl') && fixtureFeature.startsWith('get')) {
          scripts.push(`../fixtures/${fixtureGroup}/${fixtureFeature}`);
        } else {
          for await (const fName of await readdirNoDS(`../fixtures/${fixtureGroup}/${fixtureFeature}`)) {
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

/**
 * Multiple repos with the same simple name exist.
 * (70) vuejs/core (450) adonisjs/core
 * (3) twbs/bootstrap (490) angular-ui/bootstrap
 *
 * While experimenting, they are in different groups, which is fine,
 * however while analyzing and summarizing, conflicts may occur.
 *
 * FIXME: Temporarily solution: Merge the results of the same simple name repos
 */
export async function getRepoAndCommits({start, end, commits}) {
  const csv = parseSync(await readFile(LIST_FILE_PATH), {columns: true});
  const returned = {};

  for (const [index, repo] of csv.entries()) {
    if (index + 1 < start || (end && index >= end)) {
      continue;
    }

    const simpleName = repo.name.split('/')[1];
    // Remove redundant commits
    const uniqueCommits = new Set(
      commits.map(i => repo[`commit_-${(i * 0.5).toFixed(1)}Y`])
    );

    if (returned[simpleName]) {
      console.warn(`Simple name ${simpleName} conflict for repo '${repo.name}'`);
      returned[simpleName] = [...returned[simpleName], ...[...uniqueCommits].filter(x => x !== '')];
    } else {
      returned[simpleName] = [...uniqueCommits].filter(x => x !== '');
    }
  }

  return returned;
}

export async function db2RepoNameMap() {
  const csv = parseSync(await readFile(LIST_FILE_PATH), {columns: true});
  const returned = {};

  for (const repo of csv) {
    const simpleName = repo.name.split('/')[1];

    const uniqueCommits = new Set(
      [0, 1, 2, 3, 4].map(i => repo[`commit_-${(i * 0.5).toFixed(1)}Y`])
    );

    [...uniqueCommits].filter(x => x !== '').forEach(x => returned[`${simpleName}@${x}`] = repo.name);
  }

  return returned;
}

export async function getCommitDate() {
  const csv = parseSync(await readFile(LIST_FILE_PATH), {columns: true});
  const returned = {};

  for (const repo of csv.values()) {
    const simpleName = repo.name.split('/')[1];

    for (const i of [0, 1, 2, 3, 4]) {
      const commitCol = `commit_-${(i * 0.5).toFixed(1)}Y`;
      const commitDate = repo[commitCol + '_date'];
      if (commitDate === '') {
        continue;
      }
      const year = parseInt(commitDate.substring(0, 4)),
        month = parseInt(commitDate.substring(5, 7)),
        dbKey = `${simpleName}@${repo[commitCol]}`;

      let value = undefined;
      if (year < 2022 || (year === 2022 && month <= 1)) {
        value = 2022.0;
      } else if (year === 2022 && month <= 7) {
        value = 2022.5;
      } else if (year < 2023 || (year === 2023 && month <= 1)) {
        value = 2023.0;
      } else if (year === 2023 && month <= 7) {
        value = 2023.5;
      } else {
        value = 2024.0;
      }

      returned[dbKey] = value;
    }
  }

  return returned;
}

export async function getDBSize(dbDir, {start, end, commits}) {
  const repoCommitMap = await getRepoAndCommits({start, end, commits});

  const data = {};

  for (const [repo, commits] of Object.entries(repoCommitMap)) {
    for (const commit of commits) {
      const name = repo + '@' + commit;

      try {
        const {size} = await fsstat(path.join(dbDir, name, 'coref_javascript_src.db'));
        data[name] = size / 1024 / 1024; // MB
      } catch (e) {
        // DB does not exist
      }
    }
  }

  return data;
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

    const repos = await readdirNoDS(repoDir);
    const dbs = await readdirNoDS(dbDir);

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

    const repos = await readdirNoDS(repoDir);
    const dbs = await readdirNoDS(dbDir);

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

        const dbContent = await readdirNoDS(path.join(dbDir, name));

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

    const repos = await readdirNoDS(repoDir);
    const dbs = await readdirNoDS(dbDir);

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

        const existing = await readdirNoDS(dbPath);

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

cli.command('get-repo-meta')
  .description('Retrieve meta data of repo that has successfully created db by invoking standalone JS script')
  .argument('<repo-dir>', 'The base dir where cloned repos are stored')
  .argument('<db-dir>', 'The base dir where dbs are stored')
  .addOption(new Option('-s --start <start>', 'Start repo count').argParser(value => parseInt(value, 10)).default(1))
  .addOption(new Option('-e --end <end>', 'End repo count').argParser(parseInt))
  .addOption(new Option('-c --commits <commits...>', 'Commit indices to work on').argParser(parseArrayInt))
  .addOption(new Option('-o --override', 'Override existing result').default(false))
  .action(async (repoDir, dbDir, opts) => {
    const repoCommitMap = await getRepoAndCommits(opts);
    const dbSizes = await getDBSize(dbDir, opts);

    for (const [repo, commits] of Object.entries(repoCommitMap)) {
      for (const commit of commits) {
        const name = repo + '@' + commit;
        if (!(name in dbSizes)) {
          console.log(`DB '${name}' not found in the given directory, skipped`);
          continue;
        }

        const dbPath = path.join(dbDir, name);

        if (!opts.override) {
          const existing = await readdirNoDS(dbPath);
          if (existing.includes('repo-meta.json')) {
            console.log(`Meta result already exists for DB '${name}', skipped`);
            continue;
          }
        }

        console.log(`Calculating meta data for DB '${name}'`);
        await exec(`git checkout ${commit} -f`, {cwd: path.join(repoDir, repo)});
        try {
          await exec(`node ../fixtures/_utils/repo-meta-scan.js ${path.join(repoDir, repo)} ${dbPath}`);
        } catch {
          continue;
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
  .addOption(new Option('-t --timeout <timeout>', 'Timeout (in minute) for each Godel script\nSet to 0 to disable timeout').argParser(parseFloat).default(10))
  .addOption(new Option('-o --override', 'Override existing godel results').default(false))
  .addOption(new Option('-g --groups <group...>', 'Run only specified fixture groups (with all features in them)\nItem ends with .gdl will be treated as a script'))
  .action(async (dbDir, opts) => {
    let scripts = [];
    // Get run script list
    if (opts.groups?.length > 0) {
      const grp = opts.groups.filter(g => !g.endsWith('.gdl'));
      const scpt = opts.groups.filter(g => g.endsWith('.gdl'));

      for (const group of grp) {
        for (const entry of (await readdirNoDS(`../fixtures/${group}`))) {
          if (entry.endsWith('.gdl')) {
            scripts.push(entry.substring(4));
          } else {
            for (const subEntry of (await readdirNoDS(`../fixtures/${group}/${entry}`))) {
              if (subEntry.endsWith('.gdl') && subEntry.startsWith('get')) {
                scripts.push(subEntry.substring(4));
              }
            }
          }
        }
      }

      scripts.push(...scpt);
    } else {
      scripts = await readdirNoDS('../lib');
    }

    const dbs = await readdirNoDS(dbDir);

    const repoCommitMap = await getRepoAndCommits(opts);
    const dbSizes = await getDBSize(dbDir, opts);
    let remainingSize = Object.values(dbSizes).reduce((p, c) => p + c, 0);
    // Seconds per MB
    let averageExecSpeed = 0;

    const csvWrite = stringify({
      header: true, columns: [
        // repo@commit
        'name',
        // in seconds (each script)
        ...scripts,
      ]
    });
    csvWrite.pipe(createWriteStream(`../logs/${currTimestamp()}-gdl.csv`));

    for (const [repo, commits] of Object.entries(repoCommitMap)) {
      for (const commit of commits) {
        const db = repo + '@' + commit;

        if (!dbs.includes(db)) {
          console.log(`DB '${db}' not found in the given directory, skipped`);
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

        const existing = await readdirNoDS(dbPath);

        let commitExecTime = 0;
        for (const script of scripts) {
          if (!opts.override) {
            const resultName = script.replace('.gdl', '.json');
            if (existing.includes(resultName)) {
              console.log(`Godel result '${resultName}' already exists for DB '${db}', skipped`);
              log[script] = 'EXISTING';
              continue;
            }
          }

          console.log(`Running Godel script '${script}' on DB '${db}'`);
          const scriptPath = path.resolve(process.cwd(), '../lib', script);

          const startTime = Date.now();
          try {
            await exec(
              `sparrow query run --format json --database ${dbPath} --gdl ${scriptPath} --output ${dbPath}`,
              {timeout: opts.timeout * 60 * 1000},
            );
            const endTime = Date.now();

            const scriptExecTime = ((endTime - startTime) / 1000);
            log[script] = scriptExecTime.toFixed(2);
            commitExecTime += scriptExecTime;
          } catch (e) {
            console.error(`Failed to run Godel script '${script}' on DB '${db}'`);

            const endTime = Date.now();
            const scriptExecTime = ((endTime - startTime) / 1000);
            if (e.message === 'TIMEOUT') {
              log[script] = 'TIMEOUT';
            } else {
              log[script] = 'N/A';
            }
            commitExecTime += scriptExecTime;
          }
        }

        csvWrite.write(log);
        // Remove old log listener to prevent accumulating all previous logs
        process.removeListener('SIGINT', writeLogAndExit);

        averageExecSpeed = (averageExecSpeed + commitExecTime / dbSizes[db]) / (averageExecSpeed === 0 ? 1 : 2);
        remainingSize -= dbSizes[db];
        const estimatedRemainingTime = remainingSize * averageExecSpeed;
        console.log('\nEstimated remaining time: '
          + ~~(estimatedRemainingTime / 3600 / 24) + 'D '
          + ~~(estimatedRemainingTime % (3600 * 24) / 3600) + ':'
          + ~~(estimatedRemainingTime % 3600 / 60) + ':'
          + ~~(estimatedRemainingTime % 60) + '\n');
      }
    }
  });

cli.command('post-process')
  .description('Invoke post process JS scripts to process Godel\'s output and generate final metric results')
  .argument('<db-dir>', 'The base dir where dbs are stored')
  .addOption(new Option('-s --start <start>', 'Start repo count').argParser(value => parseInt(value, 10)).default(1))
  .addOption(new Option('-e --end <end>', 'End repo count').argParser(parseInt))
  .addOption(new Option('-c --commits <commits...>', 'Commit indices to work on').argParser(parseArrayInt))
  .addOption(new Option('--no-merge', 'Do not merge new results with existing results\nOld results will be lost)'))
  .addOption(new Option('-g --groups <group...>', 'Run only specified fixture groups\nUsing "group/feature" to specify feature only'))
  .action(postProcess);

cli.command('analyze')
  .description('Invoke analyze functions of each feature on full db results to generate final metric results')
  .argument('<db-dir>', 'The base dir where dbs are stored')
  .action(async dbDir => {
    const commitDate = await getCommitDate();

    const data = {};

    let dbCount = 0;
    // Assuming all results contain the same amount of features
    for (const db of await readdirNoDS(dbDir)) {
      dbCount += 1;
      const res = JSON.parse(
        await readFile(path.join(dbDir, db, 'results.json'), 'utf-8'),
        function (k, v) {
          if (k.startsWith('feature-usage-')) {
            return v * 100;
          } else {
            return v;
          }
        }
      );

      const date = commitDate[db].toFixed(1);

      let featCount = 0;
      Object.entries(res).forEach(([fKey, fValue]) => {
        featCount += 1;
        process.stdout.write(`${dbCount} - ${featCount}\r`);
        if (!data[fKey]) {
          data[fKey] = {};
        }

        const feature = data[fKey];

        Object.entries(fValue).forEach(([mKey, _mValue]) => {
          // Normalize metric value
          const mValue = _mValue < 0 ? 0 : _mValue;

          /**
           * For number metric, calculate its max value and trace its db, also stores
           * all values.
           */
          if (typeof mValue === 'number') {
            if (feature[mKey] === undefined) {
              feature[mKey] = {
                // Force key order
                all: {
                  '2022.0': [],
                  '2022.5': [],
                  '2023.0': [],
                  '2023.5': [],
                  '2024.0': [],
                }
              };
              if (mKey.startsWith('feature-usage-') || mKey.startsWith('max-count-of-')) {
                feature[mKey].max = -1;
                feature[mKey].maxSource = [];
              } else {
                feature[mKey].sum = 0;
              }
            }

            feature[mKey].all[date].push(mValue);

            if (mKey.startsWith('feature-usage-') || mKey.startsWith('max-count-of-')) {
              if (mValue > feature[mKey].max) {
                feature[mKey].max = mValue;
                feature[mKey].maxSource = [db];
              } else if (mValue === feature[mKey].max) {
                feature[mKey].maxSource.push(db);
              }
            } else {
              feature[mKey].sum += mValue;
            }
          }
          /**
           * For boolean metric, accumulate `true` count.
           */
          else if (typeof mValue === 'boolean') {
            if (feature[mKey] === undefined) {
              feature[mKey] = {
                count: {
                  '2022.0': 0,
                  '2022.5': 0,
                  '2023.0': 0,
                  '2023.5': 0,
                  '2024.0': 0,
                }
              };
            }

            if (mValue === true) {
              feature[mKey]['count'][date] += 1;
            }
          }
          /**
           * For object metric, accumulate its values. Note that a value of a key can only
           * be number.
           */
          else if (typeof mValue === 'object') {
            if (!feature[mKey]) {
              feature[mKey] = {};
            }

            Object.entries(mValue).forEach(([k, v]) => {
              // obj['constructor'] is a predefined key
              feature[mKey][k] = ((k === 'constructor' && typeof feature[mKey][k] === 'function') ? 0 : (feature[mKey][k] ?? 0)) + v;
            });
          }
        });
      });
    }

    // Calculate both avg/median and avg/median without all 0 values
    Object.values(data).forEach((fValue) => {
      Object.values(fValue).forEach((mValue) => {
        if ('max' in mValue) {
          mValue.avg = {};
          mValue.median = {};
          mValue.pavg = {};
          mValue.pmedian = {};

          Object.entries(mValue.all).forEach(([k, v]) => {
            mValue.avg[k] = v.reduce((p, c) => p + c, 0) / v.length;
            mValue.median[k] = v.sort((a, b) => a - b)[Math.floor(v.length / 2)];

            const pvalues = v.filter(x => x !== 0);
            mValue.pavg[k] = pvalues.reduce((p, c) => p + c, 0) / pvalues.length;
            mValue.pmedian[k] = pvalues.sort((a, b) => a - b)[Math.floor(pvalues.length / 2)];
          });
        }
      });
    });

    // TODO: Remove all entries if max is 0

    await writeFile(
      LIST_FILE_PATH.replace('.csv', '-results.json'),
      JSON.stringify(data, null, 2),
    );
  });

cli.command('trace')
  .description('Trace the raw data source of a specific metric\nRequires \'../repo-list/xxx-results.json\' to exist')
  .argument('<db-dir>', 'The base dir where dbs are stored')
  .argument('<feature>', 'The feature name')
  .argument('<metric>', 'The metric name')
  .addOption(new Option('-i --indices <index...>', 'The result index (of max source) to trace').argParser(parseArrayInt))
  .addOption(new Option('-f --full', 'Display full results inspect of its length'))
  .addOption(new Option('-s --shuffle <seed>', 'Shuffle the trace results and output only 10 of them for case study'))
  .action(async (dbDir, feature, metric, {indices, full, shuffle}) => {
    const data = JSON.parse(await readFile(LIST_FILE_PATH.replace('.csv', '-results.json'), 'utf-8'));
    const nameMap = await db2RepoNameMap();

    if (!data[feature]) {
      console.log(`Feature '${feature}' not found in the results.json`);
      return;
    }

    const [mainMetric, metricType] = metric.split('/');
    if (!data[feature][mainMetric]) {
      console.log(`Metric '${metric}' not found in the results.json`);
      return;
    }

    if (indices) {
      for (const index of indices) {
        const dbKey = data[feature][metric].maxSource[index];
        const traceResult = await trace(feature, metric, path.resolve(dbDir, dbKey));

        if (traceResult === undefined) {
          console.error(`Failed to trace feature '${feature}' metric '${metric}' on db ${dbKey} (index '${index})'`);
        } else {
          console.log(`Trace result of feature '${feature}' metric '${metric}' on db ${dbKey} (index '${index})':`);
          // Use GitHub to display code file to avoid frequently checkout in local
          if (typeof traceResult === 'string') {
            console.log(`https://github.com/${nameMap[dbKey]}/blob/${dbKey.split('@')[1]}/${traceResult}`);
          }
        }
      }
    } else {
      const allDBs = await readdirNoDS(dbDir);
      const results = [];

      let count = 0;
      for (const dbKey of allDBs) {
        count += 1;
        process.stdout.write(`${count}/${allDBs.length}\r`);
        const traceResult = await trace(feature, metric, path.resolve(dbDir, dbKey));

        if (traceResult === undefined) {
          console.error(`Failed to trace feature '${feature}' metric '${metric}' on db ${dbKey}`);
        } else {
          for (const record of Array.isArray(traceResult) ? traceResult : [traceResult]) {
            results.push(`https://github.com/${nameMap[dbKey]}/blob/${dbKey.split('@')[1]}/${record}`);
          }
        }
      }
      console.log(`Trace results of feature '${feature}' metric '${metric}' (Total ${results.length}):`);

      if (shuffle) {
        console.log(`(Shuffled to 10 results with seed '${shuffle}')`);
        if (results.length < 10) {
          console.log(results.join('\n'));
          return;
        }

        seed(shuffle, {global: true});
        const previousIndices = [];
        for (const i of Array.from({length: 10}, (_, i) => i)) {
          let index = Math.floor(Math.random() * results.length);
          while (previousIndices.includes(index)) {
            index = Math.floor(Math.random() * results.length);
          }
          console.log(results[index]);
        }

        seed.resetGlobal();
      } else if (results.length > 50 && !full) {
        console.log('Too many results, only displaying the first 50');
        console.log(results.slice(0, 50).join('\n'));
      } else {
        console.log(results.join('\n'));
      }
    }
  });


cli.command('summary')
  .description('Collect all log data and generate a summary report\nRequires \'../lib\' holds all godel scripts')
  .argument('<db-dir>', 'The base dir where dbs are stored')
  .addOption(new Option('-f --fragment <fragment...>', 'The table fragment to use'))
  .action(async (dbDir, {fragment}) => {
    const ALL_OPTS = {
      start: 1,
      end: 800,
      commits: [0, 1, 2, 3, 4]
    };

    const repoCommitMap = await getRepoAndCommits(ALL_OPTS);

    const data = {};

    // Build table structure
    console.log('Building table structure');
    const header = [
      'name',
      // 'history-index',          // The commit date index (0~4)
      'code-loc',               // Only count code
      'loc-with-comment',       // Count both code and comments
      'db-size',                // MB
      'db-creation-duration',   // Seconds
      // Godel script query duration (in seconds)
    ];

    (await readdirNoDS('../lib')).forEach(script => {
      header.push(script);
    });

    const manualResults = [
      'llm-invocation-on-react-class-component-methods.json',
      'repo-meta.json',
    ];
    manualResults.forEach(r => header.push(r));

    for (const [repo, commits] of Object.entries(repoCommitMap)) {
      for (const commit of commits) {
        const name = repo + '@' + commit;
        data[name] = {};
      }
    }

    // Read data source and fill the table

    // Read db size
    console.log('Reading db size');
    for (const [name, size] of Object.entries(await getDBSize(dbDir, ALL_OPTS))) {
      data[name]['db-size'] = size;
    }
    for (const f of await Promise.all(fragment?.map(async f => parseSync(await readFile(f), {columns: true}))) ?? []) {
      for (const record of f) {
        if (record['db-size']) {
          data[record['name']]['db-size'] = record['db-size'];
        }
      }
    }


    // Read existing db data (in case of log lost)
    console.log('Reading existing db data');
    const allCount = Object.values(repoCommitMap).reduce((p, c) => p + c.length, 0);
    let currCount = 0;
    for (const [repo, commits] of Object.entries(repoCommitMap)) {
      for (const commit of commits) {
        currCount += 1;
        process.stdout.write(`(${currCount}/${allCount})\r`);

        const name = repo + '@' + commit;
        const dbPath = path.join(dbDir, name);
        const dataEntry = data[name];

        try {
          for (const entry of await readdirNoDS(dbPath)) {
            if (entry === 'loc.json') {
              const content = JSON.parse(await readFile(path.join(dbPath, entry), 'utf-8'));
              dataEntry['code-loc'] = content['SUM']['code'];
              dataEntry['loc-with-comment'] = content['SUM']['comment'] + content['SUM']['code'];
            } else if (manualResults.includes(entry)) {
              dataEntry[entry] = 'EXISTING';
            } else if (entry.endsWith('.json')) {
              dataEntry[entry.replace('.json', '.gdl')] = 'NOLOG';
            }
          }
        } catch (e) {
          // DB does not exist
        }
      }
    }

    // Read execution logs
    console.log('Reading execution logs');
    for (const entry of await readdirNoDS('../logs')) {
      const csvRead = createReadStream(path.join('../logs', entry))
        .pipe(parse({
          columns: true,
        }));

      try {
        for await (const log of csvRead) {
          const name = log['name'];
          const dataEntry = data[name];

          for (const [_key, _value] of Object.entries(log)) {
            let key = _key, value = parseFloat(_value);
            if (_key === 'name') {
              continue;
            } else if (_key === 'db_creation_duration') {
              key = 'db-creation-duration';
            }

            if (isNaN(value)) {
              value = _value === '' ? undefined : _value;
            }


            // Handle data overriding
            // All possible values: 'NOLOG',' TIMEOUT', 'FAILED', 'N/A', 'EXISTING', number, undefined, ''
            const OVERRIDING_POLICY = {
              'NOLOG': {
                'TIMEOUT': 'OVERRIDE',
                'FAILED': 'OVERRIDE',
                'EXISTING': 'SUPPRESS',
                'N/A': 'OVERRIDE',
                'number': 'OVERRIDE',
                'undefined': 'SUPPRESS',
              },
              'TIMEOUT': {
                'number': 'OVERRIDE',
                'TIMEOUT': 'SUPPRESS',
                'EXISTING': 'OVERRIDE',
              },
              'FAILED': {
                'TIMEOUT': 'OVERRIDE',
                'FAILED': 'SUPPRESS',
                'number': 'OVERRIDE',
              },
              'N/A': {
                'TIMEOUT': 'OVERRIDE',
                'number': 'OVERRIDE',
                'N/A': 'SUPPRESS',
                'EXISTING': 'SUPPRESS',
              },
              'EXISTING': {
                'number': 'OVERRIDE',
              },
              'number': {
                'number': 'OVERRIDE',
                'EXISTING': 'SUPPRESS',
              },
              'undefined': {
                'TIMEOUT': 'OVERRIDE',
                'FAILED': 'OVERRIDE',
                'N/A': 'OVERRIDE',
                'number': 'OVERRIDE',
                'undefined': 'SUPPRESS',
                'EXISTING': 'SUPPRESS',
              },
            };
            const existing = dataEntry[key];
            let usingPolicy = OVERRIDING_POLICY[existing] ?? OVERRIDING_POLICY[typeof existing];
            usingPolicy = usingPolicy[value] ?? usingPolicy[typeof value];

            if (usingPolicy === 'OVERRIDE') {
              dataEntry[key] = value;
            } else if (usingPolicy === undefined) {
              console.warn(`Undefined overriding policy for '${existing}' and '${value}'`);
            }
          }
        }
      } catch (e) {
        if (e.code === 'CSV_RECORD_INCONSISTENT_COLUMNS') {
          console.log(e);
          console.log(`at ${path.join('../logs', entry)}`);
          continue;
        }
      }
    }

    let allSlots = 0, filedSlots = 0;
    Object.entries(data).forEach(([name, entry]) => {
      allSlots += Object.keys(entry).length;
      filedSlots += Object.values(entry).filter(v => typeof v === 'number').length;
    });
    console.log(`Progress: ${filedSlots / allSlots * 100}`);

    // Old summary (if exists) will simply be overwritten by the new one
    const csvWrite = stringify({
      header: true, columns: header
    });
    csvWrite.pipe(createWriteStream(LIST_FILE_PATH.replace('.csv', '-summary.csv')));

    Object.entries(data).forEach(([name, entry]) => {
      csvWrite.write({name, ...entry});
    });
  });

cli.command('sample')
  .description('Sample the data at file level to generate a smaller data set for manual inspection')
  .argument('<db-dir>', 'The base dir where dbs are stored')
  .addOption(new Option('-b --batch <size>', 'The data set size for each feature').argParser(parseInt))
  .addOption(new Option('-g --godelscripts [script...]', 'GodelScript to sample'))
  .addOption(new Option('-s --shuffle <seed>', 'Shuffle the sample results with seed'))
  .action(async (dbDir, {batch, godelscripts, shuffle}) => {
    await mkdir('../sample', {recursive: true});
    const dbs = await readdirNoDS(dbDir);
    const nameMap = await db2RepoNameMap();
    const CSVHEADER = [
      /**
       * -2 = Single line code file (Should be excluded in preprocessing)
       * -1 = False Negative
       * 0 = False Positive
       * 1 = True Positive (Record extracted by the script)
       */
      'mask',
      'fileIndex', 'recordIndex', 'url'
    ];

    godelscripts ??= (await readdirNoDS('../lib')).map(e => e.replace('.gdl', ''));

    for (const script of godelscripts) {
      if (!(script in GODELMETA)) {
        continue;
      }

      const filePathFields = GODELMETA[script].FP;
      if (filePathFields === undefined) {
        console.log('Bad meta configuration: No file path field specified');
        continue;
      }

      const recordCountGroupedByFile = Array.from({length: filePathFields.length}, () => ({}));
      let dbCount = 0;
      for (const db of dbs) {
        dbCount += 1;
        process.stdout.write(`(${dbCount}/${dbs.length})   \r`);
        let json;
        try {
          json = JSON.parse(await readFile(path.join(dbDir, db, script + '.json'), 'utf-8'));
          if (Array.isArray(json)) {
            const [newArr, removed] = filter(json);
            if (removed > 0) {
              json = newArr;
              console.log(`Removed ${removed} entries from ${script}.json in ${db}`);
            }
          } else {
            for (const [k, v] of Object.entries(json)) {
              if (Array.isArray(v)) {
                const [newArr, removed] = filter(json[k]);
                if (removed > 0) {
                  json[k] = newArr;
                  console.log(`Removed ${removed} entries from ${script}.json -> ${k} in ${db}`);
                }
              }
            }
          }
        } catch {
          continue;
        }

        for (const [slot, filePathField] of Object.entries(filePathFields)) {
          if (filePathField === '.') {
            const groupCount = groupCountBy(json, 'filePath');
            Object.entries(groupCount).forEach(([filePath, count]) => {
              recordCountGroupedByFile[parseInt(slot)][`${db}|${filePath}`] = count;
            });
          } else {
            const segments = filePathField.split('/');
            if (segments.length === 2) {
              const groupCount = groupCountBy(json[segments[0]], segments[1] === '.' ? 'filePath' : segments[1]);
              Object.entries(groupCount).forEach(([filePath, count]) => {
                recordCountGroupedByFile[parseInt(slot)][`${db}|${filePath}`] = count;
              });
            }
            // else if (segments.length === 4) {
            //   // Local group - Local/Foreign key - Foreign group - Foreign file path
            //   const mapping = new Map();
            //   for (const [i, e] of json[segments[2]].entries()) {
            //     mapping.set(e[segments[1]], i);
            //   }
            //   json[segments[0]].forEach(e => {
            //     e.filePath = json[segments[2]][mapping.get(e[segments[1]])][segments[3] === '.' ? 'filePath' : segments[3]];
            //   });
            //
            //   const groupCount = groupCountBy(json[segments[0]], 'filePath');
            //   Object.entries(groupCount).forEach(([filePath, count]) => {
            //     recordCountGroupedByFile[parseInt(slot)][`${db}|${filePath}`] = count;
            //   });
            // }
          }
        }
      }

      for (const [slot, entries] of recordCountGroupedByFile.entries()) {
        const allFiles = Object.keys(entries),
          fullFileLength = allFiles.length;

        const sortedIndex = [...Object.entries(entries).entries()].sort((a, b) => b[1][1] - a[1][1]).map(e => parseInt(e[0]));

        const shuffledFileEntries = [];
        seed(shuffle, {global: true});
        const previousIndices = [];
        for (const i of Array.from({length: batch}, (_, i) => i)) {
          let index = Math.floor(Math.random() * fullFileLength);
          while (previousIndices.includes(index)) {
            index = Math.floor(Math.random() * fullFileLength.length);
          }
          shuffledFileEntries.push(allFiles[sortedIndex[index]]);
        }
        seed.resetGlobal();

        const csvWrite = stringify({
          header: true, columns: [...CSVHEADER, ...GODELMETA[script].EX[slot]],
        });
        csvWrite.pipe(createWriteStream(`../sample/${script}-${slot}.csv`));

        let fileIndex = -1;
        for (const entry of shuffledFileEntries) {
          fileIndex += 1;
          const [db, filePath] = entry.split('|');

          let json = JSON.parse(await readFile(path.join(dbDir, db, script + '.json'), 'utf-8'));
          if (Array.isArray(json)) {
            const [newArr, removed] = filter(json);
            if (removed > 0) {
              json = newArr;
              console.log(`Removed ${removed} entries from ${script}.json`);
            }
          } else {
            for (const [k, v] of Object.entries(json)) {
              if (Array.isArray(v)) {
                const [newArr, removed] = filter(json[k]);
                if (removed > 0) {
                  json[k] = newArr;
                  console.log(`Removed ${removed} entries from ${script}.json -> ${k}`);
                }
              }
            }
          }

          let recordIndex = -1;
          if (filePathFields[slot] === '.') {
            for (const record of json) {
              if (record.filePath === filePath) {
                recordIndex += 1;

                const ln = GODELMETA[script].LN[slot].map(field => 'L' + record[field]).join('-');
                csvWrite.write({
                  mask: 1,
                  fileIndex,
                  recordIndex,
                  url: `https://github.com/${nameMap[db]}/blob/${db.split('@')[1]}/${filePath}#${ln}`,
                  ...GODELMETA[script].EX[slot].reduce((p, c) => {
                    p[c] = record[c];
                    return p;
                  }, {}),
                });
              }
            }
          } else {
            const segments = filePathFields[slot].split('/');
            if (segments.length === 2) {
              for (const record of json[segments[0]]) {
                if (record[segments[1] === '.' ? 'filePath' : segments[1]] === filePath) {
                  recordIndex += 1;

                  const ln = GODELMETA[script].LN[slot].map(field => 'L' + record[field]).join('-');
                  csvWrite.write({
                    mask: 1,
                    fileIndex,
                    recordIndex,
                    url: `https://github.com/${nameMap[db]}/blob/${db.split('@')[1]}/${filePath}#${ln}`,
                    ...GODELMETA[script].EX[slot].reduce((p, c) => {
                      p[c] = record[c];
                      return p;
                    }, {}),
                  });
                }
              }
            }
          }
        }
      }
    }
  });

cli.command('sample-merge')
  .description('Merge sample results')
  .action(async () => {
    const files = await readdirNoDS('../sample');

    let recordCount = 0;
    for (const file of files) {
      const csvRead = createReadStream(path.join('../sample', file))
        .pipe(parse({
          columns: true,
        }));

      for await (const record of csvRead) {
        recordCount += 1;
      }
    }

    console.log(`Total record count: ${recordCount}`);
  });

cli.parse(process.argv);
