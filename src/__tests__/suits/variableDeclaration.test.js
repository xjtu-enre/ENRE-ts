import global from '../../core/utils/global';
import {analyse, cleanAnalyse} from '../../core/analyser';
import {buildCodeLocation} from '../../core/utils/codeLocHelper';

beforeEach(() => {
  cleanAnalyse();
});

describe('variable declaration', () => {
  test('using let', async () => {
    await analyse('src/__tests__/cases/_variableDeclaration/_1_usingLet.js');
    const captured = global.eContainer.all.filter(e => e.type === 'variable');

    //test('has 2 variable entities', () => {
    expect(captured.length).toBe(2);
    //});

    //test('1st is foo0', () => {
    expect(captured[0].name).toBe('foo0');
    expect(captured[0].location).toEqual(buildCodeLocation(1, 4, 4));
    expect(captured[0].kind).toBe('let');
    //});

    //test('2nd is foo1', () => {
    expect(captured[1].name).toBe('foo1');
    expect(captured[1].location).toEqual(buildCodeLocation(2, 4, 4));
    expect(captured[1].kind).toBe('let');
    //});
  });

  describe('using const', async () => {
    await analyse('src/__tests__/cases/_variableDeclaration/_2_usingConst.js');
    const captured = global.eContainer.all.filter(e => e.type === 'variable');

    expect(captured[0].name).toBe('foo');
    expect(captured[0].location).toEqual(buildCodeLocation(1, 6, 3));
    expect(captured[0].kind).toBe('const');
  });
});
