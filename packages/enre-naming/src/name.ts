const ENRENameKind = ['Norm', 'Pkg', 'File', 'Anon', 'Sig', 'Str', 'Num', 'Pvt', 'Unk'] as const;
const ENRENameAnonKind = ['Function', 'Class', 'ArrowFunction', 'Block'] as const;
const ENRENameSigKind = ['Callable', 'NumberIndex', 'StringIndex'] as const;

export function addENRENameAnonKind(kinds: string[]) {
  // @ts-ignore
  ENRENameAnonKind.push(...kinds);
}

export default class ENREName<T extends typeof ENRENameKind[number]> {
  // Normal name, the payload is an identifier (string).
  // e.g.: foo
  constructor(kind: 'Norm', payload: string);
  // A package name, the payload is its name.
  // e.g.: <Pkg foo>
  constructor(kind: 'Pkg', payload: string);
  // A file name, the payload is its name (base+ext).
  // e.g.: <File foo.js>
  constructor(kind: 'File', payload: string);
  // An anonymous entity, the payload denotes what kind of anonymous entity it is.
  // The key is the unique identifier that distinguish it from other anonymous entities.
  // e.g.: <Anon Function 1:1> (The key is formed by start line and start column)
  constructor(kind: 'Anon', payload: typeof ENRENameAnonKind[number], key?: string);
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
  constructor(kind: 'Unk');
  constructor(
    public kind: T,
    public payload?: string,
    public extra?: number | string,
  ) {
    if (ENRENameKind.indexOf(kind) === -1) {
      throw `Invalid ENREName.kind ${kind}`;
    }

    if (kind !== 'Unk' && payload === undefined) {
      throw `ENREName.kind ${kind} should have payload set`;
    }

    if (kind === 'Anon' && ENRENameAnonKind.indexOf(payload as any) === -1) {
      throw `Invalid ENREName.payload ${payload} of ENREName.kind Anon`;
    }

    if (kind === 'Sig' && ENRENameSigKind.indexOf(payload as any) === -1) {
      throw `Invalid ENREName.payload ${payload} of ENREName.kind Sig`;
    }

    if (kind === 'Num' && extra === undefined) {
      this.extra = Number(payload);
      if (isNaN(this.extra)) {
        console.warn(`ENREName.actual evaluated to NaN for ENREName.kind Num and ENREName.payload ${payload}`);
      }
    }
  }

  get codeName() {
    if (this.kind === 'Anon') {
      return '';
    } else if (this.kind === 'Sig') {
      return '';
    } else if (this.kind === 'Unk') {
      return '';
    } else if (this.kind === 'Str') {
      return `'${this.payload}'`;
    } else if (this.kind === 'Num') {
      return `${this.extra}`;
    } else if (this.kind === 'Pvt') {
      return `#${this.payload}`;
    } else {
      return this.payload!;
    }
  }

  get codeLength() {
    if (this.kind === 'Anon') {
      return 0;
    } else if (this.kind === 'Sig') {
      return 0;
    } else if (this.kind === 'Unk') {
      return 0;
    } else if (this.kind === 'Str') {
      return this.payload!.length + 2;
    } else if (this.kind === 'Num') {
      return this.payload!.length;
    } else if (this.kind === 'Pvt') {
      return this.payload!.length + 1;
    } else {
      return this.payload!.length;
    }
  }

  get string() {
    if (this.kind === 'Norm') {
      return this.payload!;
    } else if (this.kind === 'Unk') {
      return '<Unknown>';
    } else if (this.kind === 'Anon' && this.payload === 'Block') {
      if (this.extra !== undefined) {
        return `<Block ${this.extra}>`;
      } else {
        return '<Block>';
      }
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
    if (str === '<Unknown>') {
      return new ENREName('Unk');
    } else if (str === '<Block>') {
      return new ENREName('Anon', 'Block');
    }

    const res = this.stringRegex.exec(str);
    if (res === null) {
      return new ENREName('Norm', str);
    } else if (res[1] === 'Block') {
      return new ENREName('Anon', res[1], res[2]);
    } else {
      // @ts-ignore
      return new ENREName(res[1], res[2]);
    }
  }
}
