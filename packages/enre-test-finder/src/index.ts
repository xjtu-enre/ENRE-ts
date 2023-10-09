import parse from './parse';
import {createLogger} from '@enre/shared';
import {promises as fs} from 'fs';

export const logger = createLogger('test finder');

export type ListOption = {
  [group: string]: true | Array<string>;
};

export interface TestGroupItem {
  category: 'entity' | 'relation' | 'implicit' | 'manual',
  prettyName: string,
  path: string,
  fileName: string,
}

/**
 * Given an option object, fetch fs paths for all entity/relation kinds according to the option.
 */
export default async function (cliOpts: ListOption): Promise<TestGroupItem[]> {
  const allCategories = await parse();

  // Read documents not listed in README.md
  try {
    const f = await fs.readdir('./docs/implicit', 'utf-8');

    for (const fileName of f) {
      allCategories['implicit'].push({name: fileName.slice(0, -3), path: `implicit/${fileName}`});
    }
  } catch (e: any) {
    logger.error(`Error with errno=${e.errno} and code=${e.code}\n\tat docs/implicit`);
  }

  const categoryProxy =
    Object.keys(cliOpts).length === 0 ? ['entity', 'relation', 'implicit', 'manual'] : Object.keys(cliOpts);

  const testGroupItems: TestGroupItem[] = [];
  for (const category of categoryProxy) {
    if (['entity', 'relation', 'implicit'].includes(category)) {
      /**
       * Read all possible types from the README.md instead of iterating paths
       * to keep the logical order of types.
       */
      if (!cliOpts[category] || cliOpts[category] === true) {
        testGroupItems.push(...allCategories[category].map(i => ({
          category: category as 'entity' | 'relation' | 'implicit',
          prettyName: i.name,
          path: `docs/${i.path}`,
          fileName: i.path.substring(i.path.indexOf('/') + 1, i.path.length - 3),
        })));
      } else {
        for (const userInputType of (cliOpts[category] as string[])) {
          const filtered = allCategories[category].filter(i => i.name.toLowerCase() === userInputType.toLowerCase());
          if (filtered.length === 1) {
            testGroupItems.push({
              category: category as 'entity' | 'relation' | 'implicit',
              prettyName: filtered[0].name,
              path: `docs/${filtered[0].path}`,
              fileName: filtered[0].path.substring(filtered[0].path.indexOf('/') + 1, filtered[0].path.length - 3),
            });
          } else {
            logger.error(`Nonexistent ${category} type ${userInputType} in docs/README.md`);
          }
        }
      }
    } else if (category === 'manual') {
      if (!cliOpts[category] || cliOpts[category] === true) {
        try {
          const groups = await fs.readdir('./tests/cases');
          for (const group of groups) {
            if (!group.startsWith('_')) {
              testGroupItems.push({
                category: 'manual',
                prettyName: group,
                path: `tests/cases/${group}`,
                fileName: group,
              });
            }
          }
        } catch (e: any) {
          logger.error(`Error with errno=${e.errno} and code=${e.code}\n\tat tests/cases`);
        }
      } else {
        for (const userInputType of (cliOpts[category] as string[])) {

          testGroupItems.push({
            category: 'manual',
            prettyName: userInputType,
            path: `tests/cases/${userInputType}`,
            fileName: userInputType,
          });
        }
      }
    } else {
      logger.error(`Unknown test category ${category}`);
    }
  }

  return testGroupItems;
}
