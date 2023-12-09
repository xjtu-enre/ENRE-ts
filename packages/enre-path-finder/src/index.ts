import {ENREFS, ENREFSDir, ENREFSFile} from './types';
import {createLogger, supportedFileExt} from '@enre-ts/shared';
import {promises as fs} from 'fs';
import path from 'path';

const logger = createLogger('path finder');

export default async function (
  inputPaths: string[],
  exclude?: string[],
): Promise<ENREFS> {
  const enreFs: ENREFS = {
    inputs: [],
    excludes: exclude ?? [],
    tree: [],
    files: [],
    pkgJsons: [],
    [Symbol.iterator]: function* () {
      // Create package entity first
      for (const item of this.pkgJsons) {
        yield item;
      }
      for (const item of this.files) {
        yield item;
      }
    },
  };

  // TODO: Merge common parent directory
  for (const inputPath of inputPaths) {
    let iPath = path.normalize(inputPath);

    if (!path.isAbsolute(iPath)) {
      logger.warn(`Input path ${iPath} is not absolute, using process.cwd() as base path`);
      iPath = path.join(process.cwd(), iPath);
    }

    logger.info(`Processing input path ${iPath}`);

    enreFs.inputs.push(iPath);

    try {
      const stats = await fs.stat(iPath);

      if (stats.isFile()) {
        const dirname = path.dirname(iPath);
        // ENREFS is a tree, so we need to create a directory node first
        const dirEntity: ENREFSDir = {
          type: 'dir', name: dirname, fullname: dirname, dirs: [], files: []
        };
        const fileEntity: ENREFSFile = {
          type: 'file',
          name: path.basename(iPath),
          fullname: iPath,
          ext: path.extname(iPath).slice(1),
          dir: dirEntity
        };
        dirEntity.files.push(fileEntity);
        enreFs.tree.push(dirEntity);
        enreFs.files.push(fileEntity);
      } else if (stats.isDirectory()) {
        const dirEntity: ENREFSDir = {
          type: 'dir',
          name: iPath,
          fullname: iPath,
          dirs: [],
          files: [],
        };
        enreFs.tree.push(dirEntity);

        const waitingList = await fs.readdir(iPath, {withFileTypes: true});
        const dirHelper: ENREFSDir[] = [dirEntity];
        const dirHelperCounter: number[] = [waitingList.length];

        while (waitingList.length !== 0) {
          if (dirHelperCounter.length > 0) {
            /**
             * In case in the previous loop, an empty directory was found,
             * which appended a 0 to the counter.
             */
            while (dirHelperCounter[dirHelperCounter.length - 1] < 1) {
              dirHelper.pop();
              dirHelperCounter.pop();
            }
            // Processing an item, decrease the counter
            if (dirHelperCounter[dirHelperCounter.length - 1] > 0) {
              dirHelperCounter[dirHelperCounter.length - 1] -= 1;
            }
          }

          const upperDir = dirHelper[dirHelper.length - 1];
          const record = waitingList.pop();

          if (record === undefined) {
            /* ok */
          } else if (record.isFile()) {
            // Force ignoring rules
            if (!supportedFileExt.includes(path.extname(record.name) as any)) {
              logger.verbose(`Ignoring file ${path.join(upperDir.fullname, record.name)} due to it is not supported`);
              continue;
            } else if (['package-lock.json'].includes(record.name)) {
              logger.verbose(`Ignoring file ${path.join(upperDir.fullname, record.name)} due to it is a package-lock.json file`);
              continue;
            }
            // Customized ignoring rules

            const fileEntity: ENREFSFile = {
              type: 'file',
              name: record.name,
              fullname: path.join(upperDir.fullname, record.name),
              ext: path.extname(record.name).slice(1),
              dir: upperDir
            };
            upperDir.files.push(fileEntity);
            if (record.name === 'package.json') {
              enreFs.pkgJsons.push(fileEntity);
            } else {
              enreFs.files.push(fileEntity);
            }
          } else if (record.isDirectory()) {
            // Force ignoring rules
            if (record.name.startsWith('.')) {
              logger.verbose(`Ignoring directory ${path.join(upperDir.fullname, record.name)} due to it starts with a dot`);
              continue;
            } else if (record.name === 'node_modules') {
              logger.verbose(`Ignoring directory ${path.join(upperDir.fullname, record.name)} due to it is a node_modules directory`);
              continue;
            }
            // Customized ignoring rules
            if (exclude !== undefined && exclude.includes(record.name)) {
              logger.verbose(`Ignoring directory ${path.join(upperDir.fullname, record.name)} due to it is in the exclude list`);
              continue;
            }

            const subDirContent = await fs.readdir(path.join(upperDir.fullname, record.name), {withFileTypes: true});

            const subDirEntity: ENREFSDir = {
              type: 'dir',
              name: record.name,
              fullname: path.join(upperDir.fullname, record.name),
              dirs: [],
              files: [],
            };
            upperDir.dirs.push(subDirEntity);

            dirHelper.push(subDirEntity);
            dirHelperCounter.push(subDirContent.length);
            waitingList.push(...subDirContent);
          } else {
            logger.warn(`Unhandled path type in ${path.join(upperDir.fullname, record.name)}`);
          }
        }
      } else {
        logger.warn(`Unhandled path type in ${iPath}`);
      }
    } catch (e: any) {
      if (e.code === 'ENOENT') {
        logger.error(`No such file or directory at ${e.path}`);
      } else {
        logger.error(`Unknown error with errno=${e.errno} and code=${e.code}`);
      }
    }
  }

  return enreFs;
}
