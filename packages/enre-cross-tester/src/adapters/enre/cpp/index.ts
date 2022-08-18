import creator from './creator';
import extractor from './extractor';
import builder from './builder';
import {error} from '@enre/logging';
import {CaseContainer} from '@enre/doc-parser';
import {CPPMatcher} from '../../../matchers';

export default async (g: string, c: string, cs: CaseContainer, ocwd: string, exepath: string) => {
  if (await creator(g, c, exepath)) {
    const data = await extractor(g, c, ocwd);
    if (data) {
      console.log(data.replaceAll(/\s+/g, ' '));
      builder(data);
      return CPPMatcher(cs);
    } else {
      error(`Failed to read enre output on ${g}/${c}`);
    }
  } else {
    error(`Failed to execute enre on ${g}/${c}`);
  }
};
