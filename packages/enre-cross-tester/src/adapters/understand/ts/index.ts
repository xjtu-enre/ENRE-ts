import creator from './creator';
import extractor from './extractor';
import builder from './builder';
import {error} from '@enre/logging';
import {CaseContainer} from '@enre/doc-parser';
import {TSMatcher} from '../../../matchers';

export default async (g: string, c: string, cs: CaseContainer) => {
  if (await creator(g, c)) {
    const data = await extractor(g, c);
    if (data) {
      console.log(data);
      builder(data);
      return TSMatcher(cs);
    } else {
      error(`Failed to extract understand database on ${g}/${c}`);
    }
  } else {
    error(`Failed to create understand database on ${g}/${c}`);
  }
};
