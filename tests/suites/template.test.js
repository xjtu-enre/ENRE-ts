import usingCore, {preferences} from '@enre/core';

it('test if this works', () => {
  preferences.set('logging.verbose', true);
  usingCore('packages/enre-core/src');
});
