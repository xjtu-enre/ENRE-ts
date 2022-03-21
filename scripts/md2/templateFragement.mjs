import template from '@babel/template';

export const header = template.program(`/**
 * This file is auto generated, please DO NOT MODIFY.
 */

import global from '../../src/core/utils/global';
import {analyse, cleanAnalyse} from '../../src/core/analyser';
import {buildFullLocation, expandENRELocation} from '../../src/core/utils/locationHelper';

beforeEach(() => {
  cleanAnalyse();
});

%%body%%
`, {
  preserveComments: true
});

export const describeCase = template.default(`describe(%%name%%, () => {
  let captured;

  beforeAll(async () => {
    %%beforeAll%%
  });

  %%tests%%
});
`);
