import parse from '../src/entity-ref-meta';

describe('Entity reference specifier parser', () => {
  describe('should not throw errors and return a parsed object in valid cases', () => {
    it('such as class:\'Foo\'', () => {
      expect(parse('class:\'Foo\'')).toStrictEqual({type: 'class', name: 'Foo', isFullName: false});
    });

    it('such as enum member:\'foo\'', () => {
      expect(parse('enum member:\'foo\'')).toStrictEqual({type: 'enum member', name: 'foo', isFullName: false});
    });

    it('such as function:\'Foo.bar\'', () => {
      expect(parse('function:\'Foo.bar\'')).toStrictEqual({type: 'function', name: 'Foo.bar', isFullName: true});
    });

    it('such as parameter:\'a\'[@loc=2]', () => {
      expect(parse('parameter:\'a\'[@loc=2]')).toStrictEqual({
        type: 'parameter',
        name: 'a',
        isFullName: false,
        predicates: {loc: {file: 0, start: {line: 2}}},
      });
    });

    it('such as parameter:\'Foo.b\'[@loc=file1:3:4:3:5]', () => {
      expect(parse('parameter:\'Foo.b\'[@loc=file1:3:4:3:5]')).toStrictEqual({
        type: 'parameter',
        name: 'Foo.b',
        isFullName: true,
        predicates: {loc: {file: 1, start: {line: 3, column: 4}, end: {line: 3, column: 5}}},
      });
    });

    it('such as function:\'foo\'[@async=true @get=true @loc=1:2]', () => {
      expect(parse('function:\'foo\'[@async=true @get=true @loc=1:2]')).toStrictEqual({
        type: 'function',
        name: 'foo',
        isFullName: false,
        predicates: {async: true, get: true, loc: {file: 0, start: {line: 1, column: 2}, end: undefined}},
      });
    });

    it('such as function:\'foo\'[@async=true      @get=true]', () => {
      expect(parse('function:\'foo\'[@async=true      @get=true]')).toStrictEqual({
        type: 'function',
        name: 'foo',
        isFullName: false,
        predicates: {async: true, get: true},
      });
    });
  });

  describe('should tolerant syntax correct but semantic invalid cases', () => {
    it('such as \'class:\'\'', () => {
      expect(parse('class:\'\'')).toStrictEqual({
        type: 'class',
        name: '',
        isFullName: false,
      });
    });

    it('such as \'class:\'Foo\'[]', () => {
      expect(parse('class:\'Foo\'[]')).toStrictEqual({
        type: 'class',
        name: 'Foo',
        isFullName: false,
      });
    });
  });

  describe('should throw errors in invalid cases', () => {
    it('such as \'\'', () => {
      expect(() => parse('')).toThrow('Unexpected empty entity reference specifier');
    });

    it('such as class', () => {
      expect(() => parse('class')).toThrow('Unexpected end of entity reference specifier, expecting :');
    });

    it('such as class:', () => {
      expect(() => parse('class:')).toThrow('Unexpected end of entity reference specifier, expecting left \'');
    });

    it('such as class:Foo', () => {
      expect(() => parse('class:Foo')).toThrow('Unexpected char \'F\' at class:[F]oo, expecting left \'');
    });

    it('such as class:\'Foo\'[', () => {
      expect(() => parse('class:\'Foo\'[')).toThrow('Unexpected end of entity reference specifier, expecting @');
    });

    it('such as class:\'Foo\'[@', () => {
      expect(() => parse('class:\'Foo\'[@')).toThrow('Unexpected end of entity reference specifier, expecting =');
    });

    it('such as class:\'Foo\'[loc', () => {
      expect(() => parse('class:\'Foo\'[loc')).toThrow('Unexpected char \'l\' at class:\'Foo\'[[l]oc, expecting @');
    });

    it('such as class:\'Foo\'[@loc', () => {
      expect(() => parse('class:\'Foo\'[@loc')).toThrow('Unexpected end of entity reference specifier, expecting =');
    });

    it('such as class:\'Foo\'[@loc=', () => {
      expect(() => parse('class:\'Foo\'[@loc=')).toThrow('Unexpected end of entity reference specifier');
    });

    it('such as class:\'Foo\'[@loc=1', () => {
      expect(() => parse('class:\'Foo\'[@loc=1')).toThrow('Unexpected end of entity reference specifier');
    });

    it('such as class:\'Foo\'[@loc=1 ', () => {
      expect(() => parse('class:\'Foo\'[@loc=1 ')).toThrow('Unexpected end of entity reference specifier');
    });

    it('such as class:\'Foo\'[@loc=1 @', () => {
      expect(() => parse('class:\'Foo\'[@loc=1 @')).toThrow('Unexpected end of entity reference specifier, expecting =');
    });

    it('such as class:\'Foo\'[@loc=1 @]', () => {
      expect(() => parse('class:\'Foo\'[@loc=1 @]')).toThrow('Unexpected char \']\' at class:\'Foo\'[@loc=1 @[]], expecting =');
    });
  });
});
