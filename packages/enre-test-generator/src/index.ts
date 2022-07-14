import parser from '@enre/doc-parser';
import finder from '@enre/doc-path-finder';
import {promises as fs} from 'fs';
import clean from './cleaner';

// TODO: Cache md5 and only regenerate files that were modified

export default async function (opts: any) {
  await parser(
    /* path generator */ finder(opts),

    async (path, groupMeta) => {
      await clean(groupMeta.name);
    },

    async (path, caseObj, groupMeta) => {
      const casePath = `tests/cases/_${groupMeta.name}/_${caseObj.assertion.name}`;
      await fs.mkdir(casePath);

      for (const file of caseObj.code) {
        await fs.writeFile(`${casePath}/${file.path}`, file.content);
      }
    }
  );
}
