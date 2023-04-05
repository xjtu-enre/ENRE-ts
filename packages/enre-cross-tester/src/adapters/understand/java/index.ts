import creator from './creator';
import extractor from './extractor';
import builder from './builder';
import {error} from '@enre/logging';
import {CaseContainer} from '@enre/doc-parser';
import {UNIMatcher} from '../../../matchers';
import {readFile} from 'node:fs/promises';

export default async (g: string, c: string, cs: CaseContainer, ocwd: string, exepath: string) => {
  /**
   * Using Understand for Java analysis is relatively slow
   * since it analysis JDk code also,
   * so we save extracted data as file to accelerate second and so on uses.
   */
  try {
    const data = await readFile(`tests/und/${g}/${c}.json`, 'utf-8');
    // console.log(data.replaceAll(/\s+/g, ' '));
    builder(data);
    return UNIMatcher(cs, 'java', 'u');
  } catch {
    if (await creator(g, c)) {
      const data = await extractor(g, c, ocwd);
      if (data) {
        // console.log(data.replaceAll(/\s+/g, ' '));
        builder(data);
        return UNIMatcher(cs, 'java', 'u');
      } else {
        error(`Failed to extract understand database on ${g}/${c}`);
      }
    } else {
      error(`Failed to create understand database on ${g}/${c}`);
    }
  }
};
