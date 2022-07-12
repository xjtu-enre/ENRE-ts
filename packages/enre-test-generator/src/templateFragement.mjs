import template from '@babel/template';

export const header = template.program(`/* *****************************************************************************
This file is auto generated, any changes made here will be DISCARDED
the next time pretest script run.

To modify a test case, or add some new tests that may make documentation
redundant, either
    edit the source in the correlated documentation block,
or
    create a new case file and corresponding suite file, whose name
    started WITHOUT a backslash(_), these kinds of file will be record by
    git, of course you should add them to git manually first.

Please DO NOT MODIFY this file.
***************************************************************************** */

import global from '../../src/core/utils/global';
import {analyse, cleanAnalyse} from '../../src/core/analyser';
import {buildFullLocation, expandENRELocation} from '../../src/core/utils/locationHelper';
import {buildENREName} from '../../src/core/utils/nameHelper';

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
