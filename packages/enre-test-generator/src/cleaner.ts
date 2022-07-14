import {promises as fs} from 'fs';

/**
 * Remove old generated files in a given folder,
 * create if it does not exist.
 */
export default async (identifier: string) => {
  // Remove cases
  const groupPath = `tests/cases/_${identifier}`;

  // Entries can not only be directories (officially), but also files
  let entryList: Array<string> = [];
  try {
    entryList = await fs.readdir(groupPath);
  } catch (e: any) {
    if (e.code === 'ENOENT') {
      /**
       * If the dir does not exist, just create it
       * since it will be used to contain case files later,
       * at when there will be no chance to create non-existing folder.
       *
       * (Create any missing hierarchy)
       */
      await fs.mkdir(groupPath, {recursive: true});
      return;
    }
  }

  /**
   * Remove dirs/files whose name starts with _
   */
  for (const caseName of entryList.filter(name => name.charAt(0) === '_')) {
    const casePath = `${groupPath}/${caseName}`;

    try {
      await fs.rm(casePath);
    } catch (e) {
      // Harmony ignore
    }
  }

  // Create if suite folder does not exist
  try {
    await fs.readdir('tests/suites');

    // Remove suite
    const suitePath = `tests/suites/_${identifier}.spec.js`;
    try {
      await fs.rm(suitePath);
    } catch (e) {
      // Harmony ignore
    }
  } catch (e) {
    await fs.mkdir('tests/suites');
  }
};
