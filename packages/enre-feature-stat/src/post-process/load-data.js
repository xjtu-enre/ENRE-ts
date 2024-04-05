import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {readdirNoDS} from '../utils.js';
import {EXCLUDE_BY_PATH_SEG} from './exclude-rules.js';

export default async function (resDir, selection) {
  const results = await readdirNoDS(resDir);

  const data = {};

  for (const result of results) {
    if (!result.endsWith('.json')) continue;

    if (Array.isArray(selection) && !selection.includes(result.replace('.json', ''))) continue;
    
    let json = JSON.parse(
      (await readFile(path.join(resDir, result), 'utf8')),
      // Convert 19-digit number to string to avoid precision loss
      // Should be ok if not directly display oid
      // .replace(/(-?[0-9]{19})/g, '"$1"'),

      // Declared not as an arrow function to utilize dynamic `this`
      function (k, v) {
        // Convert Godel output xxx_SB string boolean to actual boolean
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
    if (result !== 'repo-meta.json') {
      // Trying to exclude some data if matches certain patterns
      // TODO: Data cascading problem, should remove foreign data if primary key is removed
      if (Array.isArray(json)) {
        const [newArr, removed] = filter(json);
        if (removed > 0) {
          json = newArr;
          console.log(`Removed ${removed} entries from ${result}`);
        }
      } else {
        for (const [k, v] of Object.entries(json)) {
          if (Array.isArray(v)) {
            const [newArr, removed] = filter(json[k]);
            if (removed > 0) {
              json[k] = newArr;
              console.log(`Removed ${removed} entries from ${result} -> ${k}`);
            }
          }
        }
      }
    }

    data[result.replace('.json', '')] = json;
  }

  return data;
}

function filter(arr) {
  // Should naturally be in ascending order
  let removedCount = 0;
  let newArr = [];
  for (const obj of arr) {
    if ('filePath' in obj) {
      // Exclude compiled JS files
      if (EXCLUDE_BY_PATH_SEG.test(obj.filePath)) {
        removedCount += 1;
      } else {
        newArr.push(obj);
      }
    }
  }

  if (removedCount > 0) {
    return [newArr, removedCount];
  } else {
    return [arr, 0];
  }
}
