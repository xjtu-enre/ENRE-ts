import template from '@babel/template';
import {header, innerDescribe} from './templateFragement.mjs';
import * as t from '@babel/types';
import {promises as fs} from 'fs';
import generate from '@babel/generator';

/**
 * Build corresponding jest code for specified content using meta infos.
 * @param metaQueue The mate infos (refer to docs/misc/metaFormat.md for details)
 * @returns {void}
 */
export default async (metaQueue) => {
  if (metaQueue.length === 0) {
    console.log('No meta infos collected, skip');
  }

  const innerDescribes = [];

  // The first element always refers to the object describing global infos
  const dirName = metaQueue[0].name;

  for (let i = 1; i < metaQueue.length; i++) {
    let thisMeta = metaQueue[i];

    const beforeAllContent = [];
    beforeAllContent.push(
      // TODO: Extension name should be dynamic according to meta
      template.default.ast(`await analyse('tests/cases/_${dirName}/_${thisMeta.name}.js')`)
    );
    let capturedStatement;
    if (thisMeta.filter) {
      // TODO: Support filter as array
      capturedStatement = template.default.ast(`captured = global.eContainer.all.filter(e => e.type === '${thisMeta.filter}')`);
    } else {
      capturedStatement = template.default.ast(`captured = global.eContainer.all`);
    }
    beforeAllContent.push(capturedStatement);

    const innerDescribeBody = [];

    for (const [j, ent] of thisMeta.entities.entries()) {
      innerDescribeBody.push(
        template.default.ast(`test('contains entity ${ent.name}', () => {
        expect(captured[${j}].name).toBe('${ent.name}');
        expect(expandENRELocation(captured[${j}])).toEqual(buildFullLocation(${ent.loc[0]}, ${ent.loc[1]}, ${ent.name.length}));
        expect(captured[${j}].kind).toBe('${ent.kind}');
        })`)
      );
    }

    innerDescribes.push(innerDescribe({
      name: t.stringLiteral(thisMeta.name),
      beforeAll: t.blockStatement(beforeAllContent),
      tests: innerDescribeBody,
    }));
  }

  /**
   * Only create suite file if it does contain at least 1 valid testcase.
   */
  if (innerDescribes.length !== 0) {
    const outerDescribe = t.callExpression(
      t.identifier('describe'),
      [
        t.stringLiteral(dirName),
        t.arrowFunctionExpression(
          [],
          t.blockStatement(innerDescribes),
        )
      ]
    );

    const ast = header({body: outerDescribe});

    try {
      await fs.writeFile(`tests/suites/_${dirName}.test.js`, generate.default(ast).code);
      console.log(`Generated suite: ${dirName}`);
    } catch (e) {
      console.error(e);
    }
  }
};
