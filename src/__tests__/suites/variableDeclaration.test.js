import global from '../../core/utils/global';
import {analyse, cleanAnalyse} from '../../core/analyser';
import {buildCodeLocation} from '../../core/utils/codeLocHelper';

beforeEach(() => {
  cleanAnalyse();
});

describe('variable declaration', () => {
  describe('using let', () => {
    let captured;

    beforeAll(async () => {
      await analyse('src/__tests__/cases/_variableDeclaration/_1_usingLet.js');
      captured = global.eContainer.all.filter(e => e.type === 'variable');
    });

    test('has 2 variable entities', () => {
      expect(captured.length).toBe(2);
    });

    test('1st is foo0', () => {
      expect(captured[0].name).toBe('foo0');
      expect(captured[0].location).toEqual(buildCodeLocation(1, 4, 4));
      expect(captured[0].kind).toBe('let');
    });

    test('2nd is foo1', () => {
      expect(captured[1].name).toBe('foo1');
      expect(captured[1].location).toEqual(buildCodeLocation(3, 4, 4));
      expect(captured[1].kind).toBe('let');
    });
  });

  describe('using const', () => {
    let captured;

    beforeAll(async () => {
      await analyse('src/__tests__/cases/_variableDeclaration/_2_usingConst.js');
      captured = global.eContainer.all.filter(e => e.type === 'variable');
    });

    test('has 1 variable entity', () => {
      expect(captured.length).toBe(1);
    });

    test('1st is foo', () => {
      expect(captured[0].name).toBe('foo');
      expect(captured[0].location).toEqual(buildCodeLocation(1, 6, 3));
      expect(captured[0].kind).toBe('const');
    });
  });

  describe('multi vars in one line', () => {
    let captured;

    beforeAll(async () => {
      await analyse('src/__tests__/cases/_variableDeclaration/_3_multiVarsInOneLine.js');
      captured = global.eContainer.all.filter(e => e.type === 'variable');
    });

    test('has 3 variable entities', () => {
      expect(captured.length).toBe(3);
    });

    test('1st is a', () => {
      expect(captured[0].name).toBe('a');
      expect(captured[0].location).toEqual(buildCodeLocation(1, 4, 1));
      expect(captured[0].kind).toBe('let');
    });

    test('2nd is b', () => {
      expect(captured[1].name).toBe('b');
      expect(captured[1].location).toEqual(buildCodeLocation(1, 7, 1));
      expect(captured[1].kind).toBe('let');
    });

    test('3rd is c', () => {
      expect(captured[2].name).toBe('c');
      expect(captured[2].location).toEqual(buildCodeLocation(1, 10, 1));
      expect(captured[2].kind).toBe('let');
    });
  });

  describe('object destructuring', () => {
    let captured;

    beforeAll(async () => {
      await analyse('src/__tests__/cases/_variableDeclaration/_4_objectDestructuring.js');
      captured = global.eContainer.all.filter(e => e.type === 'variable');
    });

    test('has 3 variable entities', () => {
      expect(captured.length).toBe(3);
    });

    test('1st is a', () => {
      expect(captured[0].name).toBe('a');
      expect(captured[0].location).toEqual(buildCodeLocation(1, 5, 1));
    });
  });
});
