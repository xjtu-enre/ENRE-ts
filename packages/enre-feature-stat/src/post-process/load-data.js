import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';

export default async function (resDir) {
  const results = await readdir(resDir);

  const data = {};

  for (const result of results) {
    if (result.endsWith('.db')) continue;

    const jsonObj = JSON.parse(
      await readFile(path.join(resDir, result), 'utf8'),
      (k, v) => {
        if (k.endsWith('_SB')) {
          if (v === '-') {
            return undefined;
          } else if (v === 'true') {
            return true;
          } else if (v === 'false') {
            return false;
          } else {
            throw `Unexpected value '${v} for StringBoolean field '${k}'`;
          }
        } else {
          return v;
        }
      }
    );

    data[result.replace('.json', '')] = jsonObj;
  }

  return data;
}
