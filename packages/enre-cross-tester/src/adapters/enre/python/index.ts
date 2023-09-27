import creator from './creator';
import extractor from './extractor';
import builder from './builder';

import {CaseContainer} from '@enre/doc-parser';
import {UNIMatcher} from '../../../matchers';
import {readFile} from 'node:fs/promises';
import {logger} from '../../../logger';

export default async (g: string, c: string, cs: CaseContainer, ocwd: string, exepath: string) => {
  try {
    const data = await readFile(`${process.cwd()}/tests/enre/${g}/${c}/_${c}-report-enre.json`, 'utf-8');
    // console.log(data.replaceAll(/\s+/g, ' '));
    builder(data);
    return UNIMatcher(cs, 'python', 'e');
  } catch {
    if (await creator(g, c, exepath)) {
      const data = await extractor(g, c, ocwd);
      if (data) {
        // console.log(data.replaceAll(/\s+/g, ' '));
        builder(data);
        return UNIMatcher(cs, 'python', 'e');
      } else {
        logger.error(`Failed to read enre output on ${g}/${c}`);
      }
    } else {
      logger.error(`Failed to execute enre on ${g}/${c}`);
    }
  }
};
