import generate from '@babel/generator';
import template from '@babel/template';
import * as t from '@babel/types';
import {Statement} from '@babel/types';
import parser from '@enre/doc-parser';
import finder from '@enre/doc-path-finder';
import {error} from '@enre/logging';
import {promises as fs} from 'fs';
import clean from './cleaner';
import frame from './templates/frame';
import singleCase from './templates/singleCase';

// TODO: Cache md5 and only regenerate files that were modified

export default async function (opts: any) {
  let prevGroupName: string | undefined = undefined;
  let accumulatedCases: Array<Statement> = [];

  await parser(
    /* paths */ await finder(opts),

    /**
     * onGroup always write PREVIOUS group's data into file,
     * and record current group's name.
     */
    async (entry, groupMeta) => {
      if (prevGroupName === undefined) {
        prevGroupName = groupMeta.name;
      }

      // Write PREVIOUS cases into file
      if (accumulatedCases.length !== 0) {
        const ast = frame({
          body: t.callExpression(
            t.identifier('describe'),
            [
              t.stringLiteral(prevGroupName),
              t.arrowFunctionExpression(
                [],
                t.blockStatement(accumulatedCases),
              )
            ]
          )
        });

        try {
          // @ts-ignore
          await fs.writeFile(`tests/suites/_${prevGroupName}.spec.js`, generate.default(ast).code);
        } catch (e) {
          console.error(e);
        }
      }

      prevGroupName = groupMeta.name;
      accumulatedCases = [];

      // Given the CURRENT group name, init the directory in /tests
      if (groupMeta.name !== 'END_OF_PROCESS') {
        await clean(groupMeta.name);
      }
    },

    undefined,

    async (entry, caseObj, groupMeta) => {
      const casePath = `tests/cases/_${groupMeta.name}/_${caseObj.assertion.name}`;
      try {
        await fs.mkdir(casePath);
      } catch (e) {
        // Harmony ignore
      }

      for (const file of caseObj.code) {
        try {
          await fs.writeFile(`${casePath}/${file.path}`, file.content);
        } catch (e) {
          // Harmony ignore
        }
      }

      // Build specific test code and push the ast into accumulatedCases
      const tests: Array<Statement | Statement[]> = [];

      if (caseObj.assertion.entity) {
        const entity = caseObj.assertion.entity;

        if (!entity.extra) {
          if (entity.type) {
            // @ts-ignore
            const typedCount = entity.items.filter(i => !i.negative && (i.type === entity.type)).length;
            // @ts-ignore
            tests.push(template.default.ast(`
              test('only contains ${typedCount} ${entity.type} entity(s)', () => {
                expect(eGraph.where({type: '${entity.type}'}).length).toBe(${typedCount});
              })
            `));
          }

          for (const ent of entity.items) {
            let test = '';

            switch (ent.type) {
              case 'variable':
                test = `expect(ent.kind).toBe('${ent.kind}');`;
                break;

              case 'function':
                test = `
                  expect(ent.isAsync).toBe(${ent.async ?? false});
                  expect(ent.isGenerator).toBe(${ent.generator ?? false});
                `;
                break;

              case 'parameter':
                break;

              case 'class':
                test = `
                  expect(ent.isAbstract).toBe(${ent.abstract ?? false});
                `;
                break;

              case 'field':
                test = `
                  expect(ent.isStatic).toBe(${ent.static ?? false});
                  expect(ent.isPrivate).toBe(${ent.private ?? false});
                  expect(ent.isImplicit).toBe(${ent.implicit ?? false});
                  expect(ent.isAbstract).toBe(${ent.abstract ?? false});
                  expect(ent.TSModifier).toBe(${ent.TSModifier ? `'${ent.TSModifier}'` : undefined});
                `;
                break;

              case 'method':
                test = `
                  expect(ent.kind).toBe('${ent.kind ?? 'method'}');
                  expect(ent.isStatic).toBe(${ent.static ?? false});
                  expect(ent.isPrivate).toBe(${ent.private ?? false});
                  expect(ent.isImplicit).toBe(${ent.implicit ?? false});
                  expect(ent.isAsync).toBe(${ent.async ?? false});
                  expect(ent.isGenerator).toBe(${ent.generator ?? false});
                  expect(ent.isAbstract).toBe(${ent.abstract ?? false});
                  expect(ent.TSModifier).toBe(${ent.TSModifier ? `'${ent.TSModifier}'` : undefined});
                `;
                break;

              case 'property':
                break;

              case 'type alias':
                break;

              case 'enum':
                test = `
                  expect(ent.isConst).toBe(${ent.const ?? false});
                `;
                break;

              case 'enum member': {
                let valueStr;
                switch (typeof ent.value) {
                  case 'number':
                  case 'undefined':
                    valueStr = ent.value;
                    break;
                  case 'string':
                    valueStr = `'${ent.value}'`;
                    break;
                }

                test = `
                  // expect(ent.value).toBe(${valueStr});
                `;
                break;
              }

              case 'interface':
                break;

              case 'type parameter':
                break;

              default:
                error(`Entity type '${ent.type}' unimplemented for testing`);
                continue;
            }
            // TODO: Temporarily disable qualified name from evaluation
            // @ts-ignore
            tests.push(template.default.ast(`
              test('contains ${ent.negative ? 'no ' : ''}${ent.type} entity ${ent.name.printableName}', () => {
                const fetched = eGraph.where({type: '${ent.type}', name: '${ent.name.printableName}', startLine: ${ent.loc.start.line}});
                expect(fetched.length).toBe(${ent.negative ? 0 : 1});`
              + (!ent.negative ? `
                const ent = fetched[0]
                expect(ent.name.printableName).toBe('${ent.name.printableName}');
                // ${ent.qualified ? '' : '// '}expect(ent.fullName).toBe('${ent.qualified}');
                expect(expandENRELocation(fetched[0])).toEqual(buildFullLocation(${ent.loc.start.line}, ${ent.loc.start.column}, ${ent.loc.end?.line}, ${ent.loc.end?.column}));
                ${test}
            ` : '')
              + '})'
            ));
          }
        }
      }

      if (caseObj.assertion.relation) {
        // ...
      }

      accumulatedCases.push(singleCase({
        name: t.stringLiteral(caseObj.assertion.name),
        path: t.stringLiteral(`tests/cases/_${groupMeta.name}/_${caseObj.assertion.name}`),
        tests,
      }) as Statement);
    }
  );
}
