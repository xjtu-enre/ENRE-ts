import {readFile} from 'node:fs/promises';
import {writeFile} from 'fs/promises';

export default async function (data: any, tool: string, fxPath: string) {
  const dataPath = `${fxPath}/edmdata2.json`;

  let existingData;
  try {
    existingData = JSON.parse(await readFile(dataPath, 'utf-8'));
  } catch (e) {
    // @ts-ignore
    if (e.errno === -4058) {
      existingData = {};
    } else {
      console.log(e);
      return;
    }
  }

  await writeFile(dataPath, JSON.stringify(
    Object.keys(data)
      .map(k => ([k, (data[k][0] / data[k][1]).toFixed(1)]))
      .reduce((p, c) => {
        // @ts-ignore
        p[c[0]] === undefined ? p[c[0]] = {} : undefined;
        // @ts-ignore
        p[c[0]][tool] = c[1];
        return p;
      }, existingData),
    undefined, 2,
  ));
}
