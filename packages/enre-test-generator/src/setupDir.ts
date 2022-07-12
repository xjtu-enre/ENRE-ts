import {promises as fs} from 'fs';

/**
 * Remove old generated files in a given folder,
 * create if it does not exist.
 */
export default async (dirName: string): Promise<void> => {
  // Remove cases
  const fullPath = `tests/cases/_${dirName}`;

  let fileList: Array<string> = [];
  try {
    fileList = await fs.readdir(fullPath);
  } catch (e: any) {
    if (e.code === 'ENOENT') {
      /**
       * When dir does not exist, just create it
       * since it will be used to contain case files later,
       * at when there will be no chance to create non-exist folder.
       */
      await fs.mkdir(fullPath);
      return;
    }
  }

  // Remove files whose name starts with _
  for (const name of fileList.filter(name => name.charAt(0) === '_')) {
    try {
      await fs.rm(`${fullPath}/${name}`);
      // console.log(`Cleaned: ${fullPath}/${name}`);
    } catch (e) {
      // Harmony ignore
    }
  }

  // Create if suite folder does not exist
  try {
    await fs.readdir('tests/suites');
  } catch (e) {
    await fs.mkdir('tests/suites');
  }

  // Remove suite
  const suitePath = `tests/suites/_${dirName}.test.js`;
  try {
    await fs.rm(suitePath);
    // console.log(`Cleaned: ${suitePath}`);
  } catch (e) {
    // Harmony ignore
  }
};
