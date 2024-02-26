import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';

export default async function (resDir) {
  const results = await readdir(resDir);

  const data = {};

  for (const result of results) {
    if (result.endsWith('.db')) continue;

    data[result.replace('.json', '')] = JSON.parse(
      await readFile(path.join(resDir, result), 'utf8'),
      // Declared not as an arrow function to utilize dynamic `this`
      function (k, v) {
        if (k.endsWith('_SB')) {
          if (v === '-') {
            this[k.slice(0, -3)] = undefined;
          } else if (v === 'true') {
            this[k.slice(0, -3)] = true;
          } else if (v === 'false') {
            this[k.slice(0, -3)] = false;
          } else {
            throw new Error(`Unexpected value '${v} for StringBoolean field '${k}'`);
          }
        } else {
          return v;
        }
      }
    );
  }

  return data;
}
