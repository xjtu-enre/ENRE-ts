import creator from './creator';
import extractor from './extractor';
import builder from './builder';
import {error} from '@enre/logging';
import {CaseContainer} from '@enre/doc-parser';
import {PYMatcher} from '../../../matchers';

export default async (g: string, c: string, cs: CaseContainer, ocwd: string, exepath: string) => {
  if (await creator(g, c, exepath)) {
    const data = await extractor(g, c, ocwd);
    if (data) {
      console.log(data.replaceAll(/\s+/g, ' '));
      builder(data);
      return PYMatcher(cs);
    } else {
      error(`Failed to read depends output on ${g}/${c}`);
    }
  } else {
    error(`Failed to execute depends on ${g}/${c}`);
  }
};
