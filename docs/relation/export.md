## Relation: Export

An `Export Relation` establishes a link between
a `Package Entity` or `File Entity` and any other kinds of entity
that the latter one is exported so that other files can import
and use.

### Supported Patterns

```yaml
name: Export declaration
```

#### Syntax: ESM Export

```text
ExportDeclaration :
    `export` ExportFromClause FromClause `;`
    `export` NamedExports `;`
    `export` VariableStatement
    `export` Declaration
    `export` `default` HoistableDeclaration
    `export` `default` ClassDeclaration
    `export` `default` [lookahead ∉ { function, async function, class }] AssignmentExpression `;`

ExportFromClause :
    `*`
    `*` `as` ModuleExportName
    NamedExports

NamedExports :
    `{` `}`
    `{` ExportsList `}`
    `{` ExportsList `,` `}`

ExportsList :
    ExportSpecifier
    ExportsList `,` ExportSpecifier

ExportSpecifier :
    ModuleExportName
    ModuleExportName `as` ModuleExportName

ModuleExportName :
    IdentifierName
    StringLiteral

HoistableDeclaration :
    FunctionDeclaration
    GeneratorDeclaration
    AsyncFunctionDeclaration
    AsyncGeneratorDeclaration
```

##### Examples

###### Named exports

```ts
const variable = 0;

function func() {
    /* Empty */
}

class Class {
    /* Empty */
}

type OptionalNumber = number | undefined;

enum Enum {
    /* Empty */
}

interface Interface {
    /* Empty */
}

export {variable, func, Class, OptionalNumber, Enum, Interface};
```

```yaml
name: Named exports
relation:
    type: export
    extra: false
    items:
        -   from: file:'file0'
            to: variable:'variable'
            loc: file0:21:9
            kind: value
        -   from: file:'file0'
            to: function:'func'
            loc: file0:21:19
            kind: value
        -   from: file:'file0'
            to: class:'Class'
            loc: file0:21:25
            kind: value
        -   from: file:'file0'
            to: type alias:'OptionalNumber'
            loc: file0:21:32
            kind: value
        -   from: file:'file0'
            to: enum:'Enum'
            loc: file0:21:48
            kind: value
        -   from: file:'file0'
            to: interface:'Interface'
            loc: file0:21:54
            kind: value
```

###### Renamed exports

```ts
const variable = 0;

function func() {
    /* Empty */
}

class Class {
    /* Empty */
}

type OptionalNumber = number | undefined;

enum Enum {
    /* Empty */
}

interface Interface {
    /* Empty */
}

export {
    variable as V,
    func as F,
    Class as C,
    OptionalNumber as N,
    Enum as E,
    Interface as I,
}
```

```yaml
name: Renamed exports
relation:
    type: export
    extra: false
    items:
        -   from: file:'file0'
            to: variable:'variable'
            loc: file0:22:5
            as: V
            kind: value
        -   from: file:'file0'
            to: function:'func'
            loc: file0:23:5
            as: F
            kind: value
        -   from: file:'file0'
            to: class:'Class'
            loc: file0:24:5
            as: C
            kind: value
        -   from: file:'file0'
            to: type alias:'OptionalNumber'
            loc: file0:25:5
            as: N
            kind: value
        -   from: file:'file0'
            to: enum:'Enum'
            loc: file0:26:5
            as: E
            kind: value
        -   from: file:'file0'
            to: interface:'Interface'
            loc: file0:27:5
            as: I
            kind: value
```

###### Default exports

A file can only have one default export.

Some TypeScript elements cannot be exported as default, continue
reading [this issue](https://github.com/microsoft/TypeScript/issues/3792#issuecomment-303526468)
to learn more.

```js
export default function () {
    /* Empty */
}
```

```js
export default function* () {
    /* Empty */
}
```

```js
export default async function () {
    /* Empty */
}
```

```js
export default async function* () {
    /* Empty */
}
```

```js
export default class {
    /* Empty */
}
```

```ts
// TS abstract class default export can be named and unnamed.
export default abstract class {
    /* Empty */
}
```

```ts
// TS interface default export must be named
export default interface Foo {
    /* Empty */
}
```

```yaml
name: Default exports
relation:
    type: export
    extra: false
    items:
        -   from: file:'file0'
            to: function:'<Anonymous as="Function">'[file0]
            loc: file0:1:16
            default: true
        -   from: file:'file1'
            to: function:'<Anonymous as="Function">'[file1]
            loc: file1:1:16
            default: true
        -   from: file:'file2'
            to: function:'<Anonymous as="Function">'[file2]
            loc: file2:1:16
            default: true
        -   from: file:'file3'
            to: function:'<Anonymous as="Function">'[file3]
            loc: file3:1:16
            default: true
        -   from: file:'file4'
            to: class:'<Anonymous as="Class">'[file4]
            loc: file4:1:16
            default: true
        -   from: file:'file5'
            to: class:'<Anonymous as="Class">'[file5]
            loc: file5:2:16
            default: true
        -   from: file:'file6'
            to: interface:'Foo'
            loc: file6:2:16
            default: true
```

###### Reexports

A file can import-and-export another file's exports in one stop.
This suits the scenario that a library exports its internal
symbols in one single `index.js` for other libraries to import.

This does not introduce symbols to the scope like `import` would
do.

```ts
export type T = number | string | undefined;

export interface I {
    /* Empty */
}
```

```ts
export default class {
    /* Empty */
}
```

```ts
export default class Foo {
    /* Empty */
}
```

```ts
//// index.ts
export {T, I} from './file0';

export {default as C} from './file1';

/**
 * `default` as IdentifierName has restricted meaning - the default export,
 * an un-renamed reexport of `default` will make it still a default export.
 */
export {default} from './file2';
```

```yaml
name: Reexports
entity:
    items:
        -   name: C
            loc: file2:3:20
            type: variable
            negative: true
relation:
    type: export
    items:
        -   from: file:'file3'
            to: type alias:'T'
            loc: file3:1:9
        -   from: file:'file3'
            to: interface:'I'
            loc: file3:1:12
        -   from: file:'file3'
            to: class:'<Anonymous as="Class">'
            loc: file3:3:9
            as: C
        -   from: file:'file3'
            to: class:'Foo'
            loc: file3:9:9
            default: true
```

###### Export assignment expressions

```ts
//// @no-test
```

#### Semantic: TypeScript ESM Type-Only Export

Start
from [TypeScript 3.8](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export)
it supports type-only export, which adds `type` after `export` to
only export types that works on design-time in type contexts and
will be totally removed while compiling.

Note that as mentioned
in [entity/class](../entity/class.md#semantic-typescript-class-types)
, a class definition creates a value and a type. If the type is
exported exclusively (or imported exclusively), that symbol can
only be used in type contexts, which means that you
cannot `extends` that symbol, where a value is expected.

[//]: # (@formatter:off)
> Continue
> reading [this PR](https://github.com/microsoft/TypeScript/pull/35200#issue-525173080)
> to learn more about the design decision.

[//]: # (@formatter:on)

##### Examples

###### Type-only export

```ts
class C {
    field0: number;

    method0() {
        /* Empty */
    };
}

export type {C as Foo};
```

```ts
import type {Foo} from './file0';

// Usage
let obj: Foo;

// Invalid
class C extends Foo {
    // TSError: 'Foo' cannot be used as a value because it was imported using 'import type'.
}
```

```yaml
name: Type-only export
relation:
    type: export
    extra: false
    items:
        -   from: file:'file0'
            to: class:'C'
            loc: file0:9:14
            as: Foo
            kind: type
```

#### Semantic: CJS Export
