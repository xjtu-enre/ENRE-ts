import template from '@babel/template';

export default template.program(`/* *****************************************************************************
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

import {eGraph, rGraph, release, clear} from '@enre-ts/data';
import usingCore from '@enre-ts/core';
import {buildFullLocation, expandENRELocation} from '@enre-ts/location';

%%body%%
`, {
  preserveComments: true
});
