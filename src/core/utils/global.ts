import {eContainer} from '../analyser/entities/container';
import env from './env';
import {errorAndExit} from './cliRender';

let isMultiThreadEnabled = false;

let isVerboseEnabled = false;

let NUMBER_OF_PROCESSORS = 1;

let indexPath = '';

let entityId = -1;

const idGen = (): number => {
  entityId += 1;
  return entityId;
};

const reset = () => {
  if (!env.test) {
    errorAndExit('Function reset can only run under the TEST environment');
  }

  entityId = -1;
  eContainer.reset();
};

export default {
  isMultiThreadEnabled,
  isVerboseEnabled,
  NUMBER_OF_PROCESSORS,
  indexPath,
  idGen,
  reset,
  eContainer
};
