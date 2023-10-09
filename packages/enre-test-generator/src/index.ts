import generate from '@babel/generator';
import template from '@babel/template';
import * as t from '@babel/types';
import {Statement} from '@babel/types';
import {EntityRefSchema, LocSchema} from '@enre/doc-validator';
import parser from '@enre/doc-parser';
import finder from '@enre/test-finder';
import {promises as fs} from 'fs';
import clean from './cleaner';
import frame from './templates/frame';
import singleCase from './templates/singleCase';
import {createLogger} from '@enre/shared';

export const logger = createLogger('test generator');

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
      const filePathList = [];
      let casePath: string;

      if (caseObj.code) {
        casePath = `tests/cases/_${groupMeta.name}/_${caseObj.assertion.name}`;
        try {
          await fs.mkdir(casePath);
        } catch (e) {
          // Harmony ignore
        }

        for (const file of caseObj.code) {
          filePathList.push(file.path);
          try {
            await fs.writeFile(`${casePath}/${file.path}`, file.content);
          } catch (e) {
            console.log(e);
          }
        }

        if (caseObj.assertion.pkg) {
          try {
            await fs.writeFile(`${casePath}/package.json`, JSON.stringify(caseObj.assertion.pkg));
          } catch (e) {
            console.error(e);
          }
        }
      } else {
        casePath = `tests/cases/${groupMeta.name}/${caseObj.assertion.name}`;
        for (const [key, path] of Object.entries(caseObj.assertion.define)) {
          const index = parseInt(key.slice(4));
          filePathList[index] = path as string;
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
        }

        for (const ent of entity.items) {
          let test = '';

          switch (ent.type) {
            case 'package':
              break;

            case 'file':
              break;

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
                  // expect(ent.isImplicit).toBe(${ent.implicit ?? false});
                  expect(ent.isAbstract).toBe(${ent.abstract ?? false});
                  expect(ent.TSVisibility).toBe(${ent.TSVisibility ? `'${ent.TSVisibility}'` : undefined});
                `;
              break;

            case 'method':
              test = `
                  expect(ent.kind).toBe('${ent.kind ?? 'method'}');
                  expect(ent.isStatic).toBe(${ent.static ?? false});
                  expect(ent.isPrivate).toBe(${ent.private ?? false});
                  // expect(ent.isImplicit).toBe(${ent.implicit ?? false});
                  expect(ent.isAsync).toBe(${ent.async ?? false});
                  expect(ent.isGenerator).toBe(${ent.generator ?? false});
                  expect(ent.isAbstract).toBe(${ent.abstract ?? false});
                  expect(ent.TSVisibility).toBe(${ent.TSVisibility ? `'${ent.TSVisibility}'` : undefined});
                `;
              break;

            case 'property':
              test = `
                  expect(ent.signature).toBe(${ent.signature ? `'${ent.signature}'` : undefined});
                `;
              break;

            case 'alias':
              break;

            case 'namespace':
              break;

            case 'type alias':
              break;

            case 'enum':
              // TODO: Make declarations right
              test = `
                  expect(ent.isConst).toBe(${ent.const ?? false});
                  // expect(ent.declarations).toBe(${ent.declarations ?? []});
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
              test = `
                  // expect(ent.declarations).toBe(${ent.declarations ?? []});
                `;
              break;

            case 'type parameter':
              test = `
                  expect(ent.isConst).toBe(${ent.const ?? false});
                `;
              break;

            case 'jsx element':
              break;

            case 'block':
              test = `
                expect(ent.kind).toBe('${ent.kind ?? 'any'}');
              `;
              break;

            default:
              logger.error(`Entity type '${ent.type}' unimplemented for testing`);
              continue;
          }
          // TODO: Temporarily disable qualified name from evaluation
          // @ts-ignore
          tests.push(template.default.ast(`
              test('contains ${ent.negative ? 'no ' : ''}${ent.type} entity ${ent.name.string}', () => {
                const fetched = eGraph.where({type: '${ent.type}', name: '${ent.name.string}', startLine: ${ent.loc.start?.line}});
                expect(fetched.length).toBe(${ent.negative ? 0 : 1});`
            + (!ent.negative ? (`
                const ent = fetched[0];
                expect(ent.name.string).toBe('${ent.name.string}');
                // ${ent.qualified ? '' : '// '}expect(ent.getQualifiedName()).toBe('${ent.qualified}');\n`
                + (ent.type === 'file' ? '' : `expect(expandENRELocation(fetched[0])).toEqual(buildFullLocation(${ent.loc.start.line}, ${ent.loc.start.column}, ${ent.loc.end?.line}, ${ent.loc.end?.column}));`)
                + test)
              : '')
            + '})'
          ));
        }

      }

      if (caseObj.assertion.relation) {
        const relation = caseObj.assertion.relation;

        if (!relation.extra) {
          if (relation.type) {
            // @ts-ignore
            const typedCount = relation.items.filter(i => !i.negative && (i.type === relation.type)).length;
            // @ts-ignore
            tests.push(template.default.ast(`
              test('only contains ${typedCount} ${relation.type} relation(s)', () => {
                expect(rGraph.where({type: '${relation.type}'}).length).toBe(${typedCount});
              })
            `));
          }
        }

        for (const [index, rel] of relation.items.entries()) {
          let test = '';

          switch (rel.type) {
            case 'import':
              test = `
                  expect(rel.kind).toBe('${rel.kind ?? 'any'}');
                `;
              break;

            case 'export':
              test = `
                  expect(rel.kind).toBe('${rel.kind ?? 'any'}');
                  expect(rel.isDefault).toBe(${rel.default ?? false});
                  expect(rel.isAll).toBe(${rel.all ?? false});
                `;
              break;

            case 'aliasof':
              break;

            case 'call':
              break;

            case 'set':
              test = `
                  expect(rel.isInit).toBe(${rel.init ?? false});
                `;
              break;

            case 'use':
              break;

            case 'modify':
              break;

            case 'extend':
              break;

            case 'override':
              break;

            case 'decorate':
              break;

            case 'type':
              break;

            case 'implement':
              break;

            default:
              logger.error(`Relation type '${rel.type}' unimplemented for testing`);
              continue;
          }

          // TODO: Apply all loc to predicates
          // @ts-ignore
          tests.push(template.default.ast(`
              test('contains ${rel.negative ? 'no ' : ''}${rel.type} relation described in index ${index}', () => {
                const eFrom = eGraph.where({type: '${rel.from.type}', ${rel.from.isFullName ? 'full' : ''}name: '${rel.from.name}' ${getPredicateString(rel.from, filePathList)}});
                if (eFrom.length !== 1) {
                  throw 'Insufficient or wrong predicates to determine only one [from] entity.'
                }
                const eTo = eGraph.where({type: '${rel.to.type}', ${rel.to.isFullName ? 'full' : ''}name: '${rel.to.name}' ${getPredicateString(rel.to, filePathList)}});
                if (eTo.length !== 1) {
                  throw 'Insufficient or wrong predicates to determine only one [to] entity.'
                }

                const fetched = rGraph.where({from: eFrom[0], to: eTo[0], type: '${rel.type}', startLine: ${rel.loc.start.line}});
                expect(fetched.length).toBe(${rel.negative ? 0 : 1});
                  `
            + (!rel.negative ? `
                const rel = fetched[0]
                ${test}
            ` : '')
            + '})'
          ));
        }

      }

      accumulatedCases.push(singleCase({
        name: t.stringLiteral(caseObj.assertion.name),
        path: t.stringLiteral(casePath),
        tests,
      }) as Statement);
    }
  );
}

const getPredicateString = (ref: EntityRefSchema, filePathList: string[]) => {
  let str = '';
  if (ref.predicates) {
    const {loc, ...other} = ref.predicates;

    if (loc) {
      // If `@loc` is presents, then file index exists for sure
      str += `, inFile: '${filePathList[loc.file]}'`;

      if (loc.start) {
        // start.line will definitely exist if start exists
        str += `, startLine: ${loc.start.line}`;

        if (loc.start.column) {
          str += `, startColumn: ${loc.start.column}`;
        }
      }
      if (loc.end) {
        str += `, endLine: ${loc.end.line}, endColumn: ${loc.end.column}`;
      }
    }

    const writeValue = (v: string | boolean | undefined | LocSchema) => {
      if (typeof v === 'boolean') {
        return v;
      } else {
        return `'${v}'`;
      }
    };

    str += Object.keys(other).reduce((p, c) => p + `${c}: ${writeValue(other[c])}`, ', ');
  }

  return str;
};

// const index2FileEntity = (caseObj: CaseContainer, index: number) => {
//   if (caseObj.code.length <= index) {
//     throw `Cannot access index ${index} whiling only ${caseObj.code.length} code blocks exist.`;
//   }
//
//   const block = caseObj.code[index];
//   // Only need short name
//   const filename = block.path.includes('/') ? block.path.substring(block.path.lastIndexOf('/') + 1) : block.path;
//
//   return `
//     let file${index} = eGraph.where({type: 'file', name: '${filename}'});
//     if (file${index}.length !== 1) {
//       throw 'File not found';
//     }
//     file${index} = file${index}[0];
//   `;
// };
