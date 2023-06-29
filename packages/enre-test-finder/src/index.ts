import parse from './parse';
import {createLogger} from '@enre/shared';

export const logger = createLogger('test finder');

export type ListOption = {
  [group: string]: true | Array<string>;
};

export interface RMItem {
  category: 'entity' | 'relation',
  prettyName: string,
  path: string,
  fileName: string,
}

/**
 * Given an option object, fetch fs paths for all entity/relation kinds according to the option.
 */
export default async function (cilOpts: ListOption): Promise<Array<RMItem>> {
  const allCategories = await parse();

  const categoryProxy =
    Object.keys(cilOpts).length === 0 ? ['entity', 'relation'] : Object.keys(cilOpts);

  const typeProxy: Array<RMItem> = [];
  for (const category of categoryProxy) {
    /**
     * Read all possible types from the README.md instead of iterating paths
     * to keep the logical order of types.
     */
    if (!cilOpts[category] || cilOpts[category] === true) {
      typeProxy.push(...allCategories[category].map(i => ({
        category: category as 'entity' | 'relation',
        prettyName: i.name,
        path: `docs/${i.path}`,
        fileName: i.path.substring(i.path.indexOf('/') + 1, i.path.length - 3),
      })));
    } else {
      for (const userInputType of (cilOpts[category] as Array<string>)) {
        const filtered = allCategories[category].filter(i => i.name.toLowerCase() === userInputType.toLowerCase());
        if (filtered.length === 1) {
          typeProxy.push({
            category: category as 'entity' | 'relation',
            prettyName: filtered[0].name,
            path: `docs/${filtered[0].path}`,
            fileName: filtered[0].path.substring(filtered[0].path.indexOf('/') + 1, filtered[0].path.length - 3),
          });
        } else {
          logger.error(`Nonexistent ${category} type ${userInputType} in docs/README.md`);
        }
      }
    }
  }

  return typeProxy;
}
