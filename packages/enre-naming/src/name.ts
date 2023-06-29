const ENRENameKind = ['Norm', 'File', 'Anon', 'Sig', 'Str', 'Num', 'Pvt'] as const;
const ENRENameAnonKind = ['Function', 'Class', 'ArrowFunction', /* Other Language */ 'Namespace', 'Package', 'Struct', 'Union', 'Enum', 'Variable'] as const;
const ENRENameSigKind = ['Callable', 'NumberIndex', 'StringIndex'] as const;

export default class ENREName<T extends typeof ENRENameKind[number]> {
  // Normal name, the payload is an identifier (string).
  // e.g.: foo
  constructor(kind: 'Norm', payload: string);
  // A file name, the payload is its name (base+ext).
  // e.g.: <File foo.js>
  constructor(kind: 'File', payload: string);
  // An anonymous entity, the payload denotes what kind of anonymous entity it is.
  // e.g.: <Anon Function>
  constructor(kind: 'Anon', payload: typeof ENRENameAnonKind[number]);
  // A signature, the payload denotes what kind of signature it is.
  // e.g.: <Sig Callable>
  constructor(kind: 'Sig', payload: typeof ENRENameSigKind[number]);
  // A string, the payload is its content.
  // e.g.: <Str a-not-valid-identifier>
  constructor(kind: 'Str', payload: string);
  // A number, the payload is its raw value (in string), and actual is its evaluated value.
  // e.g.: <Num 1e-10>
  constructor(kind: 'Num', payload: string, actual?: number);
  // A class private member, the payload is its name without prefix `#`.
  // e.g.: <Pvt foo> (Corresponds to `#foo` in source code)
  constructor(kind: 'Pvt', payload: string);
  constructor(
    public kind: T,
    public payload: string,
    public actual?: number,
  ) {
    if (ENRENameKind.indexOf(kind) === -1) {
      throw `Invalid ENREName.kind ${kind}`;
    }

    if (kind === 'Anon' && ENRENameAnonKind.indexOf(payload as any) === -1) {
      throw `Invalid ENREName.payload ${payload} of ENREName.kind Anon`;
    }

    if (kind === 'Sig' && ENRENameSigKind.indexOf(payload as any) === -1) {
      throw `Invalid ENREName.payload ${payload} of ENREName.kind Sig`;
    }

    if (kind === 'Num' && actual === undefined) {
      this.actual = Number(payload);
      if (isNaN(this.actual)) {
        console.warn('ENREName.actual evaluated to NaN for ENREName.kind Num');
      }
    }
  }

  get codeName() {
    if (this.kind === 'Anon') {
      return '';
    } else if (this.kind === 'Sig') {
      return '';
    } else if (this.kind === 'Str') {
      return `'${this.payload}'`;
    } else if (this.kind === 'Num') {
      return `${this.actual}`;
    } else if (this.kind === 'Pvt') {
      return `#${this.payload}`;
    } else {
      return this.payload;
    }
  }

  get codeLength() {
    if (this.kind === 'Anon') {
      return 0;
    } else if (this.kind === 'Sig') {
      return 0;
    } else if (this.kind === 'Str') {
      return this.payload.length + 2;
    } else if (this.kind === 'Num') {
      return this.payload.length;
    } else if (this.kind === 'Pvt') {
      return this.payload.length + 1;
    } else {
      return this.payload.length;
    }
  }

  get string() {
    if (this.kind === 'Norm') {
      return this.payload;
    } else {
      return `<${this.kind} ${this.payload}>`;
    }
  }

  static stringRegex = new RegExp(/<(.+) (.+)>/);

  /**
   * Parse ENRE name formatted string to ENREName object.
   *
   * @param str Formatted string in the shape of `<XXX YYY>` or a normal identifier.
   */
  static fromString(str: string): ENREName<any> {
    const res = this.stringRegex.exec(str);
    if (res === null) {
      return new ENREName('Norm', str);
    } else {
      // @ts-ignore
      return new ENREName(res[1], res[2]);
    }
  }
}
