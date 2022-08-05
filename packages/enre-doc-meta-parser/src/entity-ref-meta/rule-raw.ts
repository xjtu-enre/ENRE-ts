/**
 * The format of entity reference specifier, defined in the format of `xstate` (an FSM package).
 */
import {createMachine} from '@xstate/fsm';

export default createMachine({
  id: 'ERS',
  initial: 'entityType',
  states: {
    // Match char+
    entityType: {on: {next: 'colon'}},
    // Match : exactly once
    colon: {on: {next: 'nameWrapperLeftQuote'}},
    // Match ' exactly once
    nameWrapperLeftQuote: {on: {next: 'entityName'}},
    // Match char+
    entityName: {on: {next: 'nameWrapperRightQuote'}},
    // Match ' exactly once @end-able
    nameWrapperRightQuote: {on: {next: 'predicatesWrapperLeftBracket'}},
    // Match [ exactly once
    predicatesWrapperLeftBracket: {on: {next: 'predicateAt'}},
    // Match @ exactly once
    predicateAt: {on: {next: 'predicateKey', alternative: 'predicatesWrapperRightBracket'}},
    // Match char+
    predicateKey: {on: {next: 'predicateIs'}},
    // Match = exactly once
    predicateIs: {on: {next: 'predicateValue'}},
    // Match char+, currently does not support quotes
    predicateValue: {on: {next: 'predicateSpace', alternative: 'predicatesWrapperRightBracket'}},
    // Match space+
    predicateSpace: {on: {next: 'predicateAt'}},
    // Match ] exactly once @end-able
    predicatesWrapperRightBracket: {on: {next: 'end'}},
    // End, should also be the end of the content
    end: {on: {next: 'end'}},
  }
});
