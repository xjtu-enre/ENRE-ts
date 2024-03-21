import fs from 'fs/promises';
import path from 'path';
import {readFile} from 'node:fs/promises';
import {readdirNoDS} from '../../src/utils.js';
import ts from 'typescript';
import {EXCLUDE_BY_PATH_SEG} from '../../src/post-process/exclude-rules.js';

const [, , repoDir, dbDir] = process.argv;

if (!repoDir || !dbDir) {
  console.error('No repoDir or dbDir provided');
  process.exit(-1);
}

const configFiles = {
  root: undefined,
  subs: [],
  tsconfigs: [],
  packagesCount: 0,
  hasSrc: false,
  hasLernaJson: false,
  hasNxJson: false,
};
const queue = [...(await readdirNoDS(repoDir))];

if (queue.find(v => v === 'package.json')) {
  configFiles.root = path.join(repoDir, 'package.json');
}

if (queue.find(v => v === 'packages')) {
  try {
    configFiles.packagesCount = (await readdirNoDS(path.join(repoDir, 'packages'))).length;
  } catch (e) {
    // Not a directory
  }
}

if (queue.find(v => v === 'src')) {
  configFiles.hasSrc = true;
}

configFiles.tsconfigs.push(...queue.filter(v => v.endsWith('.json') && v.includes('tsconfig')).map(v => path.join(repoDir, v)));

if (queue.find(v => v === 'lerna.json')) {
  configFiles.hasLernaJson = true;
}

if (queue.find(v => v === 'nx.json')) {
  configFiles.hasNxJson = true;
}

while (queue.length > 0) {
  let currentDir = queue.shift();
  currentDir = currentDir.startsWith(repoDir) ? currentDir : path.join(repoDir, currentDir);
  try {
    const files = await fs.readdir(currentDir);

    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stats = await fs.stat(filePath);

      if (stats.isDirectory()) {
        queue.push(filePath);
      } else if (file.endsWith('.json')) {
        if (file === 'package.json') {
          configFiles.subs.push(filePath);
        } else if (file.includes('tsconfig')) {
          configFiles.tsconfigs.push(filePath);
        }
      }
    }
  } catch (e) {
    // Suppress
  }
}

const res = {
  tsVer: new Set(),
  targetVer: new Set(),
  tslib: new Set(),
  hasSubpathImports: false,
  hasSubpathExports: false,
  hasWorkspaces: false,
  hasNxInPkgJson: false,
  hasLernaJson: configFiles.hasLernaJson,
  hasNxJson: configFiles.hasNxJson,

  hasSrc: configFiles.hasSrc,
  packagesCountByRootDir: configFiles.packagesCount,
  packagesCountByNamedPkgJson: 0,
};

try {
  configFiles.root = JSON.parse(await readFile(configFiles.root, 'utf8'));
} catch (e) {
  configFiles.root = {};
}

try {
  configFiles.subs = await Promise.all(
    configFiles.subs
      .filter(f => !EXCLUDE_BY_PATH_SEG.test(f))
      .map(async (f) => JSON.parse(await readFile(f, 'utf8')))
  );
} catch (e) {
  configFiles.subs = [];
}

try {
  configFiles.tsconfigs = await Promise.all(
    configFiles.tsconfigs
      .filter(f => !EXCLUDE_BY_PATH_SEG.test(f))
      .map(async (f) => ts.readConfigFile(f, ts.sys.readFile).config)
  );
} catch (e) {
  configFiles.tsconfigs = [];
}

for (const pkgJson of [configFiles.root, ...configFiles.subs]) {
  res.tsVer.add(pkgJson.dependencies?.typescript || pkgJson.devDependencies?.typescript || undefined);
  res.hasSubpathExports = res.hasSubpathExports || Object.prototype.hasOwnProperty.call(pkgJson, 'exports');
  res.hasSubpathImports = res.hasSubpathImports || Object.prototype.hasOwnProperty.call(pkgJson, 'imports');
  res.hasWorkspaces = res.hasWorkspaces || Object.prototype.hasOwnProperty.call(pkgJson, 'workspaces');
  res.hasNxInPkgJson = res.hasNxInPkgJson || Object.prototype.hasOwnProperty.call(pkgJson, 'nx');

  if (Object.prototype.hasOwnProperty.call(pkgJson, 'name') && pkgJson !== configFiles.root) {
    res.packagesCountByNamedPkgJson += 1;
  }
}

for (const tsconfig of configFiles.tsconfigs) {
  res.targetVer.add(tsconfig.compilerOptions?.target || undefined);
  tsconfig.compilerOptions?.lib?.forEach(v => res.tslib.add(v));
}

// Remove undefined
res.tsVer = Array.from(res.tsVer).filter(v => v);
res.targetVer = Array.from(res.targetVer).filter(v => v);
res.tslib = Array.from(res.tslib).filter(v => v);

await fs.writeFile(path.join(dbDir, 'repo-meta.json'), JSON.stringify(res, null, 2));
