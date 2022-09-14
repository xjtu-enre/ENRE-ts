import {buildENREName} from '../src';

describe('Build ENRE name', () => {
  it('with identifier string', () => {
    expect(buildENREName('foo')).toMatchSnapshot();
  });

  describe('with file payload', () => {
    it('js', () => {
      expect(buildENREName({base: 'file0', ext: 'js'})).toMatchSnapshot();
    });

    it('mjs', () => {
      expect(buildENREName({base: 'file0', ext: 'mjs'})).toMatchSnapshot();
    });

    it('cjs', () => {
      expect(buildENREName({base: 'file0', ext: 'cjs'})).toMatchSnapshot();
    });

    it('jsx', () => {
      expect(buildENREName({base: 'file0', ext: 'jsx'})).toMatchSnapshot();
    });

    it('ts', () => {
      expect(buildENREName({base: 'file0', ext: 'ts'})).toMatchSnapshot();
    });

    it('d.ts', () => {
      expect(buildENREName({base: 'file0', ext: 'd.ts'})).toMatchSnapshot();
    });

    it('mts', () => {
      expect(buildENREName({base: 'file0', ext: 'mts'})).toMatchSnapshot();
    });

    it('cts', () => {
      expect(buildENREName({base: 'file0', ext: 'cts'})).toMatchSnapshot();
    });

    it('tsx', () => {
      expect(buildENREName({base: 'file0', ext: 'tsx'})).toMatchSnapshot();
    });

    it('json', () => {
      expect(buildENREName({base: 'file0', ext: 'json'})).toMatchSnapshot();
    });
  });

  describe('with anonymous payload', () => {
    it('as Function', () => {
      expect(buildENREName({as: 'Function'})).toMatchSnapshot();
    });

    it('as ArrowFunction', () => {
      expect(buildENREName({as: 'ArrowFunction'})).toMatchSnapshot();
    });

    it('as Class', () => {
      expect(buildENREName({as: 'Class'})).toMatchSnapshot();
    });
  });

  describe('with computed payload', () => {
    it('as StringLiteral', () => {
      expect(buildENREName({raw: 'foo', as: 'StringLiteral'})).toMatchSnapshot();
    });

    it('as PrivateIdentifier', () => {
      expect(buildENREName({raw: 'foo', as: 'PrivateIdentifier'})).toMatchSnapshot();
    });

    it('as NumericLiteral', () => {
      expect(buildENREName({raw: '123', as: 'NumericLiteral', value: '123'})).toMatchSnapshot();
    });
  });

  describe('with XML string', () => {
    // TODO
  });
});
