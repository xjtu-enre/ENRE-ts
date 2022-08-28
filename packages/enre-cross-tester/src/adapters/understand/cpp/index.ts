import creator from './creator';
import extractor from './extractor';
import builder from './builder';
import {error} from '@enre/logging';
import {CaseContainer} from '@enre/doc-parser';
import {CPPMatcher} from '../../../matchers';
import exec from '../../../common/exec';
import {readFile} from 'node:fs/promises';

export default async (g: string, c: string, cs: CaseContainer, ocwd: string, exepath: string) => {
  try {
    const data = await readFile(`tests/und/${g}/${c}.json`, 'utf-8');
    console.log(data.replaceAll(/\s+/g, ' '));
    builder(data);
    return CPPMatcher(cs);
  } catch {
    if (await creator(g, c)) {
      const data = await extractor(g, c, ocwd);
      if (data) {
        console.log(data.replaceAll(/\s+/g, ' '));
        builder(data);
        return CPPMatcher(cs);
      } else {
        error(`Failed to extract understand database on ${g}/${c}`);
      }
    } else {
      error(`Failed to create understand database on ${g}/${c}`);
    }
  }
};
