import creator from './creator';
import extractor from './extractor';
import builder from './builder';
import {CaseContainer} from '@enre/doc-parser';
import {UNIMatcher} from '../../../matchers';
import {readFile} from 'node:fs/promises';
import {logger} from '../../../cli';

export default async (g: string, c: string, cs: CaseContainer, ocwd: string, exepath: string) => {
  try {
    const data = await readFile(`tests/und/${g}/${c}.json`, 'utf-8');
    // console.log(data.replaceAll(/\s+/g, ' '));
    builder(data);
    return UNIMatcher(cs, 'python', 'u');
  } catch {
    if (await creator(g, c)) {
      const data = await extractor(g, c, ocwd);
      if (data) {
        // console.log(data.replaceAll(/\s+/g, ' '));
        builder(data);
        return UNIMatcher(cs, 'python', 'u');
      } else {
        logger.error(`Failed to extract understand database on ${g}/${c}`);
      }
    } else {
      logger.error(`Failed to create understand database on ${g}/${c}`);
    }
  }
};
