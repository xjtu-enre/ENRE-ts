import template from '@babel/template';
import {describeCase, header} from './templateFragement.mjs';
import * as t from '@babel/types';
import {promises as fs} from 'fs';
import generate from '@babel/generator';

/**
 * Build corresponding jest code for code snippets using meta infos.
 * @param metaQueue {object[]} The mate infos (refers to scripts/md2/metaSchema.mjs for details)
 * @returns {void}
 */
export default async (metaQueue) => {
  if (metaQueue.length === 0) {
    throw new Error('No meta infos collected, skip');
  }

  const describedCases = [];

  // The first element always refers to the object describing a group.
  const dirName = metaQueue[0].name;

  for (let i = 1; i < metaQueue.length; i++) {
    let thisMeta = metaQueue[i];

    // Setup analyse and retrieve variables needs to be tested.
    const beforeAllContent = [];
    beforeAllContent.push(
      template.default.ast(`await analyse('tests/cases/_${dirName}/_${thisMeta.name}.${thisMeta.module ? 'mjs' : 'js'}')`)
    );
    let capturedStatement;
    // TODO: If entities is empty then do relation test build
    if (thisMeta.entities.filter) {
      capturedStatement = template.default.ast(`captured = global.eContainer.all.filter(e => e.type === '${thisMeta.entities.filter}')`);
    } else {
      capturedStatement = template.default.ast(`captured = global.eContainer.all`);
    }
    beforeAllContent.push(capturedStatement);

    const describeCaseBody = [];

    if (thisMeta.entities.exact) {
      describeCaseBody.push(template.default.ast(`
        test('(only) contains ${thisMeta.entities.items.length} entity(s)', () => {
          expect(captured.length).toBe(${thisMeta.entities.items.length});
        })
      `));
    }

    for (const [j, ent] of (thisMeta.entities.items || []).entries()) {
      let doTest;
      switch (ent.type) {
        case 'variable':
          doTest = testEntityVariable(thisMeta.entities.exact, j, ent);
          break;
        case 'function':
          doTest = testEntityFunction(thisMeta.entities.exact, j, ent);
          break;
        case 'parameter':
          doTest = testEntityParameter(thisMeta.entities.exact, j, ent);
          break;
        case 'class':
          doTest = testEntityClass(thisMeta.entities.exact, j, ent);
          break;
        case 'field':
          doTest = testEntityField(thisMeta.entities.exact, j, ent);
          break;
        case 'method':
          doTest = testEntityMethod(thisMeta.entities.exact, j, ent);
          break;
        default:
          throw new Error(`Unhandled entity type ${ent.type}, did you forget to add it to buildSuiteCode?`);
      }
      describeCaseBody.push(doTest);
    }

    describedCases.push(describeCase({
      name: t.stringLiteral(thisMeta.name),
      beforeAll: t.blockStatement(beforeAllContent),
      tests: describeCaseBody,
    }));
  }

  /**
   * Only create suite file if it does contain at least 1 valid testcase.
   */
  if (describedCases.length !== 0) {
    const outerDescribe = t.callExpression(
      t.identifier('describe'),
      [
        t.stringLiteral(dirName),
        t.arrowFunctionExpression(
          [],
          t.blockStatement(describedCases),
        )
      ]
    );

    const ast = header({body: outerDescribe});

    try {
      await fs.writeFile(`tests/suites/_${dirName}.test.js`, generate.default(ast).code);
      // console.log(`Generated suite: ${dirName}`);
    } catch (e) {
      console.error(e);
    }
  }
};

// TODO: Non-exact mode

const testEntityVariable = (exact, index, mEnt) => {
  if (exact) {
    return template.default.ast(`
    test('contains entity ${mEnt.name}', () => {
      const ent = captured[${index}];
      expect(ent.name.payload).toBe('${mEnt.name}');
      expect(expandENRELocation(ent)).toEqual(buildFullLocation(${mEnt.loc[0]}, ${mEnt.loc[1]}, ${mEnt.name.length}));
      expect(ent.kind).toBe('${mEnt.kind}');
    })
    `);
  } else {

  }
};

const testEntityFunction = (exact, index, mEnt) => {
  if (exact) {
    return template.default.ast(`
    test('contains entity ${mEnt.name}', () => {
      const ENREName = buildENREName('${mEnt.name}');
      const ent = captured[${index}];
      expect(ent.name.payload).toEqual(ENREName.payload);
      expect(expandENRELocation(ent)).toEqual(buildFullLocation(${mEnt.loc[0]}, ${mEnt.loc[1]}, ${mEnt.loc[2]} ?? ENREName.codeLength));
      expect(ent.isAsync).toBe(${mEnt.async ?? false});
      expect(ent.isGenerator).toBe(${mEnt.generator ?? false});
    })
    `);
  } else {

  }
};

const testEntityParameter = (exact, index, mEnt) => {
  if (exact) {
    return template.default.ast(`
    test('contains entity ${mEnt.name}', () => {
      const ent = captured[${index}];
      expect(ent.name.payload).toBe('${mEnt.name}');
      expect(expandENRELocation(ent)).toEqual(buildFullLocation(${mEnt.loc[0]}, ${mEnt.loc[1]}, ${mEnt.name.length}));
    })
    `);
  } else {

  }
};

const testEntityClass = (exact, index, mEnt) => {
  if (exact) {
    return template.default.ast(`
    test('contains entity ${mEnt.name}', () => {
      const ENREName = buildENREName('${mEnt.name}');
      const ent = captured[${index}];
      expect(ent.name.payload).toEqual(ENREName.payload);
      expect(expandENRELocation(ent)).toEqual(buildFullLocation(${mEnt.loc[0]}, ${mEnt.loc[1]}, ${mEnt.loc[2]} ?? ENREName.codeLength));
    })
    `);
  } else {

  }
};

const testEntityField = (exact, index, mEnt) => {
  if (exact) {
    return template.default.ast(`
    test('contains entity ${mEnt.name}', () => {
      const ENREName = buildENREName('${mEnt.name}');
      const ent = captured[${index}];
      expect(ent.name.payload).toEqual(ENREName.payload);
      expect(expandENRELocation(ent)).toEqual(buildFullLocation(${mEnt.loc[0]}, ${mEnt.loc[1]}, ${mEnt.loc[2]} ?? ENREName.codeLength));
      expect(ent.isStatic).toBe(${mEnt.static ?? false});
      expect(ent.isPrivate).toBe(${mEnt.private ?? false});
      expect(ent.isImplicit).toBe(${mEnt.implicit ?? false});
    })
    `);
  } else {

  }
};

const testEntityMethod = (exact, index, mEnt) => {
  if (exact) {
    return template.default.ast(`
    test('contains entity ${mEnt.name}', () => {
      const ENREName = buildENREName('${mEnt.name}');
      const ent = captured[${index}];
      expect(ent.name.payload).toEqual(ENREName.payload);
      expect(expandENRELocation(ent)).toEqual(buildFullLocation(${mEnt.loc[0]}, ${mEnt.loc[1]}, ${mEnt.loc[2]} ?? ENREName.codeLength));
      expect(ent.kind).toBe('${mEnt.kind ?? 'method'}')
      expect(ent.isStatic).toBe(${mEnt.static ?? false});
      expect(ent.isPrivate).toBe(${mEnt.private ?? false});
      expect(ent.isImplicit).toBe(${mEnt.implicit ?? false});
      expect(ent.isAsync).toBe(${mEnt.async ?? false});
      expect(ent.isGenerator).toBe(${mEnt.generator ?? false});
    })
    `);
  } else {

  }
};
