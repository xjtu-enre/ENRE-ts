import {caseMetaParser, FenceMeta, fenceMetaParser, groupMetaParser, GroupSchema} from '@enre/doc-meta-parser';
import {RMItem} from '@enre/doc-path-finder';
import {error, info, warn} from '@enre/logging';
import {promises as fs} from 'fs';
import {marked} from 'marked';
import YAML from 'yaml';
import {CaseContainer} from './case-container';
import {createFSMInstance} from './rule';
import Token = marked.Token;

export type {CaseContainer, CodeBlock} from './case-container';

enum SpellingCheckResult {
  fail,
  warning,
  pass,
}

export enum RuleCategory {
  syntax = 'syntax',
  semantic = 'semantic',
  runtime = 'runtime',
  supplemental = 'supplemental',
}

const strictSpellingCheck = (subject: string | undefined, base: string) => {
  if (!subject || subject.length !== base.length) {
    return SpellingCheckResult.fail;
  }

  let result = SpellingCheckResult.pass;

  for (let i = 0; i < base.length; i++) {
    if (subject[i] === base[i]) {
      /* pass */
    } else if (subject[i].toLowerCase() === base[i].toLowerCase()) {
      result = SpellingCheckResult.warning;
    } else {
      return SpellingCheckResult.fail;
    }
  }

  return result;
};

export default async function (
  entries: Array<RMItem>,
  /* The hook on a group meta is met */
  onGroup?: (entry: RMItem | undefined, groupMeta: GroupSchema) => Promise<void>,
  /* The hook on a rule title is met */
  onRule?: (entry: RMItem, category: RuleCategory, description: string, groupMeta: GroupSchema) => Promise<void>,
  /* The hook on a testable case is met */
  onTestableCase?: (entry: RMItem, caseObj: CaseContainer, groupMeta: GroupSchema) => Promise<void>,
  /* Default lang set is js/ts, this is for scalability */
  langExtName = /[Jj][Ss][Oo][Nn]|[JjTt][Ss][Xx]?/,
  langExtWarn = 'json / js / jsx / ts / tsx',
) {
  /**
   * Record succeeded case count and failed case count for every file
   */
    // TODO: Print this in the end
  const counter: Map<string, [number, number]> = new Map();

  iteratingNextFile: for (const entry of entries) {
    let f;

    try {
      f = await fs.readFile(entry.path, 'utf-8');
    } catch (e: any) {
      if (e.code === 'ENOENT') {
        error(`Cannot find document at ${entry.path}`);
      } else {
        error(`Unknown error with errno=${e.errno} and code=${e.code}\n\tat ${entry.path}`);
      }
      continue;
    }

    /**
     * Accumulate line number for better warning experience
     * (since marked does not offer access to block location)
     */
    let lineNumber = 1;

    const raise = (msg: string, fatal = true) => {
      if (fatal) {
        error(`${msg}\n\tat ${entry.path}:${lineNumber}`);
      } else {
        warn(`${msg}\n\tat ${entry.path}:${lineNumber}`);
      }
    };

    counter.set(entry.path, [0, 0]);

    /**
     * Since marked will accumulate multiple parsed results,
     * we have to create new object everytime before processing a new file.
     *
     * Also, add the content of `space` token to its previous token,
     * and remove all `space` tokens.
     */
    let tokens = new marked.Lexer().lex(f) as Token[];
    for (let i = 1; i < tokens.length; i++) {
      if (tokens[i].type === 'space') {
        tokens[i - 1].raw += tokens[i].raw;
      }
    }
    tokens = tokens.filter(i => i.type !== 'space');

    /**
     * Adding a `space` token at the array trail,
     * this is used as an EOF symbol for an easier parse logic.
     *
     * Since all real `space` were removed previously,
     * this token won't contribute any syntax or semantic conflicts.
     */
    tokens.push({type: 'space', raw: ''});

    // TODO: Do not create new instance everytime, reset its state instead
    const {fsm, next, alter, goto} = createFSMInstance();

    let groupMeta: GroupSchema;

    let ruleRole = '';

    let exampleDecorators: Pick<FenceMeta, 'noTest'> | undefined = undefined;
    let exampleCodeFenceIndex = 0;
    let exampleAccumulated: CaseContainer | undefined;

    for (const t of tokens) {
      /**
       * Sometimes an FSM state value does not correlate to a block type,
       * but maybe the next value is matched, imagining that block is "slipping"
       * on the gear of FSM states.
       *
       * So for one block, it may be evaluated more than once,
       * and this bool indicator is set to true when the evaluation
       * is performed successfully, which will end the evaluation of this block.
       *
       * Previously, "slipping" was done by omit `break;` in some points, or "fallthrough",
       * but that code style is poor on maintainability, since at the end of
       * the switch clause, it would be forced to evaluate the next block
       * in advance to send it to correct FSM state the next time that block
       * is met. The whole point is, at that state, the desired state is at upper
       * place, no trick like omitting `break;` will bring the `case` up.
       */
      let resolved = false;

      do {
        switch (fsm.state.value) {
          case 'header':
            if (t.type === 'heading') {
              if (t.depth !== 2) {
                raise('Document title should be heading with depth 2 `## *`');
                continue iteratingNextFile;
              } else {
                resolved = true;
                next();
              }
            } else if (t.type === 'space') {
              raise('Unexpected end of file');
              continue iteratingNextFile;
            } else {
              raise(`Unexpected token ${t.type}, expect document title '## *'`);
              continue iteratingNextFile;
            }
            break;

          case 'description':
            if (t.type === 'paragraph') {
              resolved = true;
              next();
            } else if (t.type === 'space') {
              raise('Unexpected end of file');
              continue iteratingNextFile;
            } else {
              raise(`Unexpected token ${t.type}, expect a paragraph right after document title`);
              continue iteratingNextFile;
            }
            break;

          case 'anyQ':
            if (t.type === 'heading') {
              next();
            } else if (t.type === 'space') {
              resolved = true;
            } else {
              resolved = true;
              alter();
            }
            break;

          case 'patternStart':
            if (t.type === 'heading') {
              if (t.depth === 3) {
                const testResult = strictSpellingCheck(t.text, 'Supported Patterns');
                if (testResult) {
                  if (testResult === SpellingCheckResult.warning) {
                    raise(`Preferring 'Supported Patterns' rather than '${t.text}'`, false);
                  }
                  resolved = true;
                  next();
                } else {
                  raise(`Unexpected '${t.raw.replaceAll('\n', '')}', expecting '### Supported Patterns'`);
                  continue iteratingNextFile;
                }
              } else {
                raise(`Unexpected h${t.depth}, expecting '### Supported Patterns'`);
                continue iteratingNextFile;
              }
            } else if (t.type === 'space') {
              resolved = true;
            } else {
              raise(`Unexpected '${t.type}', expecting '### Supported Patterns'`);
              continue iteratingNextFile;
            }
            break;

          case 'groupName':
            if (t.type === 'code') {
              if (strictSpellingCheck(t.lang, 'yaml')) {
                try {
                  groupMeta = groupMetaParser(YAML.parse(t.text));
                } catch (e) {
                  raise('Failed validation on group meta');
                  console.error(e);
                  continue iteratingNextFile;
                }

                try {
                  onGroup ? await onGroup(entry, groupMeta) : undefined;
                } catch (e) {
                  raise('Hook function onGroup throws an error', false);
                  console.error(e);
                }

                resolved = true;
                next();
              } else {
                raise(`Unexpected '${t.lang}' code fence, expecting 'yaml'`);
                continue iteratingNextFile;
              }
            } else if (t.type === 'space') {
              resolved = true;
            } else {
              raise(`Unexpected '${t.type}', expecting yaml block`);
              continue iteratingNextFile;
            }
            break;

          case 'anyW':
            if (t.type === 'heading') {
              next();
            } else if (t.type === 'space') {
              resolved = true;
            } else {
              resolved = true;
              alter();
            }
            break;

          case 'ruleTitle':
            if (t.type === 'heading') {
              if (t.depth === 4) {
                const regexResult = /^([Ss]yntax|[Ss]emantic|[Rr]untime|[Ss]upplemental)(: *)(.*)$/.exec(t.text);
                if (!regexResult) {
                  raise(`Unexpected '${t.raw.replaceAll('\n', '')}', string should starts with Syntax / Semantic / Runtime / Supplemental`);
                  continue iteratingNextFile;
                } else {
                  const firstLetter = regexResult[1].charCodeAt(0);
                  if (97 <= firstLetter && firstLetter <= 122) {
                    raise(`Preferring uppercase in the first letter rather than ${t.raw.replaceAll('\n', '')}`, false);
                  }
                  ruleRole = regexResult[1].toLowerCase();

                  if (regexResult[2] !== ': ') {
                    raise(`Preferring one space after the colon rather than ${t.raw.replaceAll('\n', '')}`, false);
                  }

                  onRule ? await onRule(entry, regexResult[1].toLowerCase() as RuleCategory, regexResult[3], groupMeta!) : undefined;

                  resolved = true;
                  if (strictSpellingCheck(regexResult[1], 'Syntax')) {
                    alter();
                  } else {
                    next();
                  }
                }
              } else {
                raise(`Unexpected h${t.depth}, expecting h4`);
                continue iteratingNextFile;
              }
            } else if (t.type === 'space') {
              resolved = true;
            } else {
              raise(`Unexpected ${t.type}, expecting '#### Syntax/Semantic/Runtime/Supplemental: *'`);
              continue iteratingNextFile;
            }
            break;

          case 'syntaxTxt':
            if (t.type === 'code') {
              if (strictSpellingCheck(t.lang, 'text')) {
                resolved = true;
                next();
              } else {
                raise(`Unexpected '${t.lang}' code fence, expecting 'text'`);
                continue iteratingNextFile;
              }
            } else if (t.type === 'space') {
              resolved = true;
            } else {
              raise(`Unexpected ${t.type}, expecting a text block right after to record correlated syntax production rules`);
              continue iteratingNextFile;
            }
            break;

          case 'anyE':
            if (t.type === 'heading') {
              next();
            } else if (t.type === 'space') {
              resolved = true;
            } else {
              resolved = true;
              alter();
            }
            break;

          case 'exampleStart':
            if (t.type === 'heading') {
              if (t.depth === 5) {
                const testResult = strictSpellingCheck(t.text, 'Examples');
                if (testResult) {
                  if (testResult === SpellingCheckResult.warning) {
                    raise(`Preferring 'Examples' rather than ${t.text}`, false);
                  }
                  resolved = true;
                  next();
                } else {
                  raise(`Unexpected ${t.raw.replaceAll('\n', '')}, expecting '##### Examples'`);
                  continue iteratingNextFile;
                }
              } else {
                if (ruleRole === 'supplemental') {
                  alter();
                } else {
                  raise(`Unexpected h${t.depth}, expecting '##### Examples'`);
                  continue iteratingNextFile;
                }
              }
            } else if (t.type === 'space') {
              resolved = true;
            } else {
              raise(`Unexpected ${t.type}, expecting '##### Examples'`);
              continue iteratingNextFile;
            }
            break;

          case 'anyR':
            if (t.type === 'heading') {
              next();
            } else if (t.type === 'space') {
              resolved = true;
            } else {
              resolved = true;
              alter();
            }
            break;

          case 'exampleTitle':
            if (t.type === 'heading') {
              if (t.depth === 6) {
                resolved = true;
                next();
              } else {
                raise(`Unexpected h${t.depth}, expecting '###### *'`);
                continue iteratingNextFile;
              }
            } else if (t.type === 'space') {
              resolved = true;
            } else {
              raise(`Unexpected ${t.type}, expecting '###### *'`);
              continue iteratingNextFile;
            }
            break;

          case 'anyT':
            if (t.type === 'heading') {
              next();
            } else if (t.type === 'code') {
              next();
            } else if (t.type === 'space') {
              raise('Unexpected end of file');
              continue iteratingNextFile;
            } else {
              resolved = true;
              alter();
            }
            break;

          case 'exampleCode':
            if (t.type === 'code') {
              if (langExtName.test(t.lang ?? '')) {
                const lineTerminatorIndex = t.text.indexOf(('\n'));
                const firstLine = lineTerminatorIndex === -1 ? t.text : t.text.slice(0, t.text.indexOf('\n'));
                let parseResult;
                try {
                  parseResult = fenceMetaParser(firstLine);
                } catch (e) {
                  raise(e as string);
                  /**
                   * These are recoverable errors, just ignore this example and go on with the next.
                   * By manually set noTest to true, this example will not be hooked, and thus ignored.
                   * (Please notice if the meaning of noTest is changed in the future.)
                   */
                  exampleDecorators = {noTest: true};
                  resolved = true;
                  next();
                  break;
                }

                if (parseResult.formatIssue) {
                  raise(`Preferring one space after '////' rather than ${firstLine}`, false);
                }

                if (parseResult.legacy) {
                  raise('If you are using legacy syntax \'// path/to/file\' for customizing file name, please change \'//\' to \'////\' and read the latest format.', false);
                }

                if (parseResult.unknownDecorator.length > 0) {
                  raise(`Unknown code fence meta decorator ${parseResult.unknownDecorator.join(', ')}, these will all be ignored`, false);
                }

                if (exampleCodeFenceIndex === 0) {
                  exampleDecorators = {noTest: parseResult.noTest};

                  if (!exampleDecorators.noTest) {
                    // Init example container at the first code block
                    exampleAccumulated = {
                      code: [],
                      assertion: undefined,
                    };
                  }
                } else {
                  if (parseResult.noTest) {
                    raise('Unexpected code fence meta decorator \'@no-test\', which is only available in the first code fence of an example', false);
                  }
                }

                if (!exampleDecorators!.noTest) {
                  // Add self (code block) to container, the path is calculated in here
                  let path;
                  if (parseResult.path) {
                    path = parseResult.path;
                  } else if (parseResult.ext) {
                    path = `file${exampleCodeFenceIndex}.${parseResult.ext}`;
                  } else {
                    /**
                     * The default file extension name is set to js,
                     * but this will not be used since empty lang name will go to else clause
                     */
                    path = `file${exampleCodeFenceIndex}.${t.lang?.toLowerCase() ?? 'js'}`;
                  }

                  let content;
                  if (parseResult.metaPresented) {
                    content = t.text.slice(t.text.indexOf('\n'));
                  } else {
                    content = t.text;
                  }

                  /**
                   * The container won't be created for examples with @no-test,
                   */
                  exampleAccumulated!.code.push({
                    path,
                    content,
                  });
                }

                resolved = true;
                exampleCodeFenceIndex += 1;
                next();
              } else if (exampleCodeFenceIndex !== 0 && t.lang === 'yaml') {
                if (exampleDecorators?.noTest) {
                  raise('Unexpected code fence lang \'yaml\', conflicting with \'@no-test\'');
                  continue iteratingNextFile;
                } else {
                  alter();
                }
              } else {
                raise(`Unexpected example lang '${t.lang}', expecting ${langExtWarn}${(exampleCodeFenceIndex === 0 || exampleDecorators?.noTest) ? '' : ' / yaml'}`);
                continue iteratingNextFile;
              }
            } else if (t.type === 'space') {
              if (exampleDecorators?.noTest) {
                resolved = true;
              } else {
                raise('Unexpected end of file');
                continue iteratingNextFile;
              }
            } else {
              if (exampleCodeFenceIndex === 0) {
                raise(`Unexpected ${t.type}, expecting code fence`);
                continue iteratingNextFile;
              } else {
                if (exampleDecorators?.noTest) {
                  goto('nextAny');
                } else {
                  raise(`Unexpected ${t.type}, assertion block is necessary`);
                  continue iteratingNextFile;
                }
              }
            }
            break;

          case 'exampleAssertion':
            /**
             * This state is only entered if noTest is false,
             * which is validated in the previous state.
             */
            if (t.type === 'code') {
              if (strictSpellingCheck(t.lang ?? '', 'yaml')) {
                try {
                  exampleAccumulated!.assertion = caseMetaParser(YAML.parse(t.text));
                } catch (e) {
                  raise('Failed validation on case meta');
                  console.error(e);
                  continue iteratingNextFile;
                }

                try {
                  /**
                   * After successfully validating assertion meta,
                   * send the whole example (code blocks and assertion) to the hook function.
                   */
                  // @ts-ignore
                  onTestableCase ? await onTestableCase(entry, exampleAccumulated, groupMeta) : undefined;
                } catch (e) {
                  raise('Hook function onTestableCase throws an error', false);
                  console.error(e);
                }

                resolved = true;
                next();
              } else {
                raise(`Unexpected code fence lang '${t.lang}', expecting 'yaml'`);
                continue iteratingNextFile;
              }
            } else if (t.type === 'space') {
              raise('Unexpected end of file');
              continue iteratingNextFile;
            } else {
              raise(`Unexpected ${t.type}, assertion block is necessary`);
              continue iteratingNextFile;
            }
            break;

          case 'anyY':
            // Clean exampleCode state variables
            exampleAccumulated = undefined;
            exampleDecorators = undefined;
            exampleCodeFenceIndex = 0;

            if (t.type === 'heading') {
              if (t.depth === 4) {
                goto('nextRule');
              } else if (t.depth === 6) {
                goto('nextExample');
              } else {
                raise(`Unexpected ${t.type}, expecting an h4 for rule title or h6 for example title`);
                continue iteratingNextFile;
              }
            } else if (t.type === 'space') {
              resolved = true;
            } else {
              resolved = true;
              alter();
            }
            break;

          default:
            raise(`Unexpected FSM state ${fsm.state.value}, broken state logic`);
            continue iteratingNextFile;
        }
      } while (!resolved);

      lineNumber += (t.raw.match(/\n/g) || []).length;
    }

    info(`Parse succeeded at ${entry.path}`);
  }

  /**
   * For end users, there are only two hooks, and there is no hook on the end of a group,
   * so it is suggested that handle group changes in the onGroup hook.
   *
   * This specific line provides the ability for end users to consume the last group
   * before the function ends (in which case, hooks would never be called, and infos about the last group
   * would be lost).
   */
  onGroup ? await onGroup(undefined, {name: 'END_OF_PROCESS', freeForm: true}) : undefined;
}
