import {buildENREName} from '../src';

describe('Build ENRE name', () => {
  it('with identifier string', () => {
    expect(buildENREName('foo')).toMatchSnapshot();
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
