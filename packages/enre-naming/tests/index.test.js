import ENREName from '../src/name';

describe('ENREName', () => {
  it('of valid string identifier', () => {
    expect(new ENREName('Norm', 'foo')).toMatchSnapshot();

    expect(ENREName.fromString('foo')).toMatchSnapshot();
  });

  it('of file name', () => {
    expect(new ENREName('File', 'foo.js')).toMatchSnapshot();

    expect(ENREName.fromString('<File foo.js>')).toMatchSnapshot();
  });

  describe('of anonymous', () => {
    it('Function', () => {
      expect(new ENREName('Anon', 'Function')).toMatchSnapshot();

      expect(ENREName.fromString('<Anon Function>')).toMatchSnapshot();
    });

    it('ArrowFunction', () => {
      expect(new ENREName('Anon', 'ArrowFunction')).toMatchSnapshot();

      expect(ENREName.fromString('<Anon ArrowFunction>')).toMatchSnapshot();
    });

    it('Class', () => {
      expect(new ENREName('Anon', 'Class')).toMatchSnapshot();

      expect(ENREName.fromString('<Anon Class>')).toMatchSnapshot();
    });

    it('Block', () => {
      expect(new ENREName('Anon', 'Block')).toMatchSnapshot();

      expect(ENREName.fromString('<Anon Block>')).toMatchSnapshot();

      expect(new ENREName('Anon', 'Block', '1:1')).toMatchSnapshot();

      expect(ENREName.fromString('<Block 1:1>')).toMatchSnapshot();
    });
  });

  describe('of signature declaration', () => {
    it('Callable', () => {
      expect(new ENREName('Sig', 'Callable')).toMatchSnapshot();

      expect(ENREName.fromString('<Sig Callable>')).toMatchSnapshot();
    });

    it('NumberIndex', () => {
      expect(new ENREName('Sig', 'NumberIndex')).toMatchSnapshot();

      expect(ENREName.fromString('<Sig NumberIndex>')).toMatchSnapshot();
    });

    it('StringIndex', () => {
      expect(new ENREName('Sig', 'StringIndex')).toMatchSnapshot();

      expect(ENREName.fromString('<Sig StringIndex>')).toMatchSnapshot();
    });
  });

  it('of string literal', () => {
    expect(new ENREName('Str', 'a-not-valid-identifier')).toMatchSnapshot();

    expect(ENREName.fromString('<Str a-not-valid-identifier>')).toMatchSnapshot();
  });

  it('of numeric literal', () => {
    expect(new ENREName('Num', '123')).toMatchSnapshot();

    expect(ENREName.fromString('<Num 1e-10>')).toMatchSnapshot();
    // TODO: Add more tests according to the form of number
  });

  it('of class private identifier', () => {
    expect(new ENREName('Pvt', 'foo')).toMatchSnapshot();

    expect(ENREName.fromString('<Pvt foo>')).toMatchSnapshot();
  });

  it('of unknown', () => {
    expect(new ENREName('Unk')).toMatchSnapshot();

    expect(ENREName.fromString('<Unknown>')).toMatchSnapshot();
  });

  describe('calculated properties', () => {
    it('codeName', () => {
      expect(new ENREName('Pvt', 'foo').codeName).toEqual('#foo');
    });

    it('codeLength', () => {
      expect(new ENREName('Pvt', 'foo').codeLength).toEqual(4);
      expect(ENREName.fromString('<Anon Block>').codeLength).toEqual(0);
      expect(ENREName.fromString('<Block 1:1>').codeLength).toEqual(0);
    });

    it('printable', () => {
      expect(new ENREName('Str', 'a-not-valid-identifier').string).toEqual('<Str a-not-valid-identifier>');
    });
  });
});
