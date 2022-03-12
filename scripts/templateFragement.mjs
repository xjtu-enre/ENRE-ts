import template from '@babel/template';

export const header = template.program(`/**
 * This file is auto generated, please DO NOT MODIFY.
 */

import global from '../../src/core/utils/global';
import {analyse, cleanAnalyse} from '../../src/core/analyser';
import {buildCodeLocation} from '../../src/core/utils/codeLocHelper';
s
beforeEach(() => {
  cleanAnalyse();
});

%%body%%
`, {
  preserveComments: true
});

export const innerDescribe = template.default(`describe(%%name%%, () => {
  let captured;

  beforeAll(async () => {
    %%beforeAll%%
  });

  %%tests%%
});
`);
