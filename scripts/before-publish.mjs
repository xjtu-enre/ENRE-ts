/**
 * This script is expected to be run with CWD as the root of the project.
 */

import {Command, CommanderError} from 'commander';
import {readdir, rm, writeFile} from 'fs/promises';
import {readFile} from 'node:fs/promises';
import semver from 'semver';
import path from 'path';

const exec = (await import('util')).promisify((await import('child_process')).exec);

const cli = new Command();

const SYNC_FIELDS = ['author', 'license', 'repository', 'bugs', 'engines', 'keywords'];

cli
  .command('version <tag>')
  .description('Update "version" field in package.json to the given tag')
  .action(async ver => {
    if (!semver.valid(ver)) {
      throw new CommanderError(-1, 'INVALID_VERSION', `Invalid version tag: ${ver}`);
    }

    const pkgJSONs = {
      'root': JSON.parse(await readFile('package.json', 'utf-8')),
    };

    for (const dir of await readdir('packages')) {
      if (dir === '.DS_Store') {
        continue;
      }

      // Read directories under `packages/` and get its package.json content
      pkgJSONs[`packages/${dir}`] = JSON.parse(await readFile(`packages/${dir}/package.json`, 'utf-8'));

      // Remove all build outputs
      await rm(`packages/${dir}/lib`, {recursive: true, force: true});
      await rm(`packages/${dir}/tsconfig.tsbuildinfo`, {force: true});
    }

    const coercedVer = semver.coerce(ver);
    const updateHistory = [];
    for (const [dir, pkgJSON] of Object.entries(pkgJSONs)) {
      // Update version
      let report = {
        packageName: dir === 'root' ? '/' : pkgJSON.name,
        oldVersion: pkgJSON.version,
        newVersion: ver,
        depVersionUpdated: false,
        syncedFields: [],
      }
      if (pkgJSON.version === ver) {
        report.newVersion = '(Not changed)';
      } else {
        pkgJSON.version = ver;
      }

      // Update dependency versions
      for (const [depName, depVer] of Object.entries(pkgJSON.dependencies ?? {})) {
        if (depName.startsWith('@enre-ts/')) {
          if (pkgJSON.dependencies[depName] !== `^${coercedVer}`) {
            report.depVersionUpdated = true;
            pkgJSON.dependencies[depName] = `^${coercedVer}`;
          }
        }
      }

      // Sync fields
      if (dir === 'root') {
        continue;
      }
      for (const field of SYNC_FIELDS) {
        let rootValue = pkgJSONs['root'][field];
        const subValue = pkgJSON[field];

        if (field === 'repository') {
          rootValue = {
            ...pkgJSONs['root'].repository,
            directory: dir,
          };
        }

        if (JSON.stringify(rootValue) !== JSON.stringify(subValue)) {
          report.syncedFields.push(field);
          pkgJSON[field] = rootValue;
        }
      }

      updateHistory.push(report);
    }
    console.table(updateHistory);

    for (const [dir, pkgJSON] of Object.entries(pkgJSONs)) {
      await writeFile(
        (dir === 'root' ? '.' : dir) + '/package.json',
        JSON.stringify(pkgJSON, null, 2)
      );
    }

    // Run a fresh build
    console.log('Building...');
    const {stdout, stderr} = await exec('npm run build');
    console.log(stdout);
    console.log(stderr);

    const timestamp = new Date().toISOString();
    await writeFile('.clean-build-tag', timestamp);
    console.warn(`Version updated and clean build succeeded at ${timestamp}, please run 'publish' command in 3 minutes, or this update will be outdated.`)
  });

cli
  .command('publish <otp>')
  .description('Publish all public packages to npm with given "opt" one-time password')
  .option('-p --pick <dir...>', 'Only publish packages in the given directories\nThis respects the "private" field in package.json')
  .action(async (otp, {pick}) => {
    let lastBuildTimestamp;
    try {
      lastBuildTimestamp = new Date(await readFile('.clean-build-tag', 'utf-8'));
    } catch (e) {
      throw new CommanderError(-1, 'INVALID_BUILD', 'Please run "version" command first.');
    }

    if (Date.now() - lastBuildTimestamp.getTime() > 3 * 60 * 1000) {
      throw new CommanderError(-1, 'OUTDATED_BUILD', 'The previous build has expired.');
    }

    for (const dir of await readdir('packages')) {
      if (dir === '.DS_Store') {
        continue;
      }

      if (pick && !pick.includes(dir)) {
        continue;
      }

      const pkgJSON = JSON.parse(await readFile(`packages/${dir}/package.json`, 'utf-8'));
      if (pkgJSON.private) {
        continue;
      }

      console.log(`Publishing ${pkgJSON.name} ${pkgJSON.version}...`);
      // https://github.com/npm/cli/issues/3993#issuecomment-970146979
      const {stdout, stderr} = await exec(`npm publish packages/${dir}/ --access public --otp ${otp}`, {
        // This is necessary, or .npmignore will be not used
        cwd: path.resolve(process.cwd(), `packages/${dir}`),
      });
      console.log(stdout);
      console.error(stderr);
    }
  })

cli.parse(process.argv);
