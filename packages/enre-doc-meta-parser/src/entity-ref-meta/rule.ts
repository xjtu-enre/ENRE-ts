import {interpret} from '@xstate/fsm';
import fsm from './rule-raw';

export const createFSMInstance = (handler?: (state: unknown) => void) => {
  const service = interpret(fsm).start();
  if (handler) {
    service.subscribe(handler);
  }

  const next = () => service.send('next');
  const alter = () => service.send('alternative');

  return {fsm: service, next, alter};
};
