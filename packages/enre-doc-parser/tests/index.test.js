import parse from '../src';
import prefixing from './path-prefix.js';

let warnSpy, errorSpy;

beforeAll(() => {
  warnSpy = jest.spyOn(console, 'warn');
  errorSpy = jest.spyOn(console, 'error');
});

describe('Doc-parser', () => {
  describe('can handle valid format', () => {
    it('in a comprehensive sample', async () => {
      await parse([prefixing('valid.md')]);

      expect(warnSpy).toBeCalledTimes(0);
      expect(errorSpy).toBeCalledTimes(0);
    });
  });

  describe('reports format warning', () => {
    it('in a comprehensive sample', async () => {
      await parse([prefixing('warn-spelling.md')]);

      expect(warnSpy).toBeCalledTimes(4);
      expect(errorSpy).toBeCalledTimes(0);
    });
  });
});
