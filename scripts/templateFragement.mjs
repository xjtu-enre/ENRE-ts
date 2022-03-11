import template from '@babel/template';

export const header = template.program(`/**
 * This file is auto generated, please DO NOT MODIFY.
 */

import global from '../../src/core/utils/global';
import {analyse, cleanAnalyse} from '../../src/core/analyser';
import {buildCodeLocation} from '../../src/core/utils/codeLocHelper';

beforeEach(() => {
  cleanAnalyse();
});

%%body%%
`, {
  preserveComments: true
});

export const beforeAll = template.expression(`beforeAll(async () => {
await analyse(%%casePath%%);
%%setCaptured%%
});
`);
