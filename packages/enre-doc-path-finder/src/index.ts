import {error} from '@enre/logging';
import {promises as fs} from 'fs';

export type ListOption = {
  [group: string]: true | Array<string>;
};

/**
 * Given an option object, fetch fs paths for all entity/relation kinds according to the option.
 */
export default async function* (opts: ListOption): AsyncGenerator<string> {
  const propertyProxy =
    Object.keys(opts).length === 0 ? ['entity', 'relation'] : Object.keys(opts);

  for (const property of propertyProxy) {
    let optionProxy: Array<string> = [];

    if (!opts[property] || opts[property] === true) {
      try {
        /**
         * This relative path expect cwd is the project root
         */
        optionProxy = await fs.readdir(`docs/${property}`);
      } catch (e) {
        error(`Cannot find doc at path 'docs/${property}', expecting 'docs/entity' and 'docs/relation'`);
        continue;
      }
    } else {
      try {
        optionProxy = (opts[property] as Array<string>).map(item => `${item}.md`);
      } catch (e) {
        continue;
      }
    }

    for (const item of optionProxy) {
      yield `docs/${property}/${item}`;
    }
  }
}
