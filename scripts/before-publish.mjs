/**
 * This script is expected to be run with CWD as the root of the project.
 */

import {Command, CommanderError} from 'commander';
import {readdir, rm, writeFile} from 'fs/promises';
import {readFile} from 'node:fs/promises';
import semver from 'semver';

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
    }

    const coercedVer = semver.coerce(ver);
    const updateHistory = [];
    for (const [dir, pkgJSON] of Object.entries(pkgJSONs)) {
      // Update version
      let report = {
        packageName: dir === 'root' ? '/' : pkgJSON.name,
        oldVersion: pkgJSON.version,
        newVersion: ver,
        dependencyUpdated: false,
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
          report.dependencyUpdated = true;
          pkgJSON.dependencies[depName] = `^${coercedVer}`;
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

    console.warn('please run `npm run build` to generate build outputs');
  });

cli.parse(process.argv);
