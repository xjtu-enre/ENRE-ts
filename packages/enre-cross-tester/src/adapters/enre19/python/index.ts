import creator from './creator';
import extractor from './extractor';
import builder from './builder';
import {error} from '@enre/logging';
import {CaseContainer} from '@enre/doc-parser';
import {UNIMatcher} from '../../../matchers';

export default async (g: string, c: string, cs: CaseContainer, ocwd: string, exepath: string) => {
  try {
    const data = await extractor(g, c, ocwd);
    builder(data);
    return UNIMatcher(cs, 'python', 'e');
  } catch {
    if (await creator(g, c, exepath)) {
      const data = await extractor(g, c, ocwd);
      if (data) {
        builder(data);
        return UNIMatcher(cs, 'python', 'e');
      } else {
        error(`Failed to read enre19 output on ${g}/${c}`);
      }
    } else {
      error(`Failed to execute enre19 on ${g}/${c}`);
    }
  }
};
