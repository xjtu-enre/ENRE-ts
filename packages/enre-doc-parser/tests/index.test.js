import parse from '../src';

let warnSpy, errorSpy;

beforeAll(() => {
  warnSpy = jest.spyOn(console, 'warn');
  errorSpy = jest.spyOn(console, 'error');
});

describe('Doc-parser', () => {
  describe('can handle valid format', () => {
    it('completely', async () => {
      await parse(['packages/enre-doc-parser/tests/fixtures/valid.md']);

      expect(warnSpy).toBeCalledTimes(0);
      expect(errorSpy).toBeCalledTimes(0);
    });
  });

  describe('reports format warning', () => {
    it('completely', async () => {
      await parse(['packages/enre-doc-parser/tests/fixtures/warn-spelling.md']);
      // TODO: Fix this
      expect(warnSpy).toBeCalledTimes(1);
      expect(errorSpy).toBeCalledTimes(0);
    });
  });

  describe('reports format error', () => {

  });
});
