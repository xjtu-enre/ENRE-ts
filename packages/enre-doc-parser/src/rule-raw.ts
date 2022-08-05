/**
 * The format of doc-testing files, defined in the format of `xstate` (an FSM package).
 *
 * All `any*` state do not accept heading with any level.
 */

import {createMachine} from '@xstate/fsm';

export default createMachine({
  id: 'CBF',
  initial: 'header',
  states: {
    /**
     * A doc-testing file always starts from a heading, with the format of
     *   `## Entity: *` or `## Relation: *`.
     * (The heading is not strictly forced to be formatted.)
     */
    header: {
      on: {next: 'description'}
    },
    /**
     * A description is forced to be presented right after the heading.
     * To give a short description on the entity/relation this file works on.
     */
    description: {
      on: {next: 'anyQ'}
    },
    /**
     * Next comes optional descriptive blocks.
     *
     * @end-able
     */
    anyQ: {
      on: {next: 'patternStart', alternative: 'anyQ'}
    },
    /**
     * The title indicates the start of the pattern block.
     *
     * `### Supported Patterns`
     *
     * @strict-check
     * @end-able
     */
    patternStart: {
      on: {next: 'groupName'}
    },
    /**
     * Right next to `### Supported Pattern` is an YAML block recording the name of the suite.
     *
     * @YAML
     * @end-able
     */
    groupName: {
      on: {next: 'anyW'}
    },
    /**
     * Any descriptive blocks.
     *
     * @end-able
     */
    anyW: {
      on: {next: 'ruleTitle', alternative: 'anyW'}
    },
    /**
     * The title of the rule block, usually follows patterns blow:
     *   `#### Syntax: *` for static syntax
     *   `#### Semantic: *` for semantic rule
     *   `#### Runtime: *` for runtime/dynamic behavior
     *   `#### Supplemental: *` for just additionally record some syntax for a more comprehensive view,
     *     in which is allowed to contain no example.
     *
     * @strict-check
     *
     * @end-able
     */
    ruleTitle: {
      on: {next: 'anyE', alternative: 'syntaxTxt'}
    },
    /**
     * A text fence recording only necessary syntax production rules.
     *
     * It is only necessary if in a `#### Syntax: *`
     *
     * @end-able
     */
    syntaxTxt: {
      on: {next: 'anyE'}
    },
    /**
     * Any descriptive blocks.
     *
     * @end-able
     */
    anyE: {
      on: {next: 'exampleStart', alternative: 'anyE'}
    },
    /**
     * A mark indicating below are examples.
     *
     * `##### Examples`
     *
     * It is only UNNECESSARY if in a `#### Supplemental: *`
     *
     * @strict-check
     * @end-able
     */
    exampleStart: {
      on: {next: 'anyR', alternative: 'ruleTitle'}
    },
    /**
     * Any descriptive blocks.
     *
     * @end-able
     */
    anyR: {
      on: {next: 'exampleTitle', alternative: 'anyR'}
    },
    /**
     * A short (maybe just 1 line) syntax item information.
     *
     * `###### A language syntax item`
     *
     * @end-able
     */
    exampleTitle: {
      on: {next: 'anyT'}
    },
    /**
     * Any descriptive blocks.
     */
    anyT: {
      on: {next: 'exampleCode', alternative: 'anyT'}
    },
    /**
     * Example code fence, must have lang label.
     *
     * This can be repeated multiple times to express complicated example.
     *
     * It is referred as `fileN` in relation assertion.
     *
     * @end-able only if @no-test presents
     */
    exampleCode: {
      on: {next: 'exampleCode', nextAny: 'anyY', alternative: 'exampleAssertion'}
    },
    /**
     * The corresponding assertion block that must be presented right after a code example.
     *
     * Can be omitted only if the first line of the first code fence contains
     *   `//// * @no-test *`
     * It is suitable for presenting code with syntax errors or semantic errors
     * that will fail to compile or run.
     * However, the use should be strictly restricted in case of any potential abuse.
     *
     * @end-able only if `@no-test` is set
     */
    exampleAssertion: {
      on: {next: 'anyY'}
    },
    /**
     * Any descriptive block.
     *
     * @end-able
     */
    anyY: {
      on: {nextExample: 'exampleTitle', nextRule: 'ruleTitle', alternative: 'anyY'}
    }
  }
});
