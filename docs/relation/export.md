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
        -   from: file:'<File base="file0" ext="ts">'
            to: variable:'variable'
            loc: file0:21:9
            kind: value
        -   from: file:'<File base="file0" ext="ts">'
            to: function:'func'
            loc: file0:21:19
            kind: value
        -   from: file:'<File base="file0" ext="ts">'
            to: class:'Class'
            loc: file0:21:25
            kind: value
        -   from: file:'<File base="file0" ext="ts">'
            to: type alias:'OptionalNumber'
            loc: file0:21:32
            kind: value
        -   from: file:'<File base="file0" ext="ts">'
            to: enum:'Enum'
            loc: file0:21:48
            kind: value
        -   from: file:'<File base="file0" ext="ts">'
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
        -   from: file:'<File base="file0" ext="ts">'
            to: variable:'variable'
            loc: file0:22:5
            alias: V
            kind: value
        -   from: file:'<File base="file0" ext="ts">'
            to: function:'func'
            loc: file0:23:5
            alias: F
            kind: value
        -   from: file:'<File base="file0" ext="ts">'
            to: class:'Class'
            loc: file0:24:5
            alias: C
            kind: value
        -   from: file:'<File base="file0" ext="ts">'
            to: type alias:'OptionalNumber'
            loc: file0:25:5
            alias: N
            kind: value
        -   from: file:'<File base="file0" ext="ts">'
            to: enum:'Enum'
            loc: file0:26:5
            alias: E
            kind: value
        -   from: file:'<File base="file0" ext="ts">'
            to: interface:'Interface'
            loc: file0:27:5
            alias: I
            kind: value
```

###### Renamed export: Rename to a string literal

The spec supports rename an export with a string literal, and it
has to be renamed again to a valid identifier whiling importing,
continue
reading [the import side](./import.md#named-import-rename-string-literals-to-valid-identifiers)
to learn how to do that.

However, neither WebStorm's parser nor TypeScript support this
feature.

[//]: # (@formatter:off)
```js
const variable = 0;

export {variable as 'a-not-valid-identifier'};
```

[//]: # (@formatter:on)

```yaml
name: Renamed export rename to string literal
pkg:
    type: module
relation:
    type: export
    extra: false
    items:
        -   from: file:'<File base="file0" ext="js">'
            to: variable:'variable'
            loc: file0:3:9
            alias: a-not-valid-identifier
```

###### Export declarations

```ts
export const a = 1, b = 2, c = 3;

export function foo() {
    /* Empty */
}

export class Foo {
    /* Empty */
}

export enum Bar {
    /* Empty */
}

export interface Baz {
    /* Empty */
}
```

```yaml
name: Export declarations
relation:
    type: export
    extra: false
    items:
        -   from: file:'<File base="file0" ext="ts">'
            to: variable:'a'
            loc: file0:1:14
        -   from: file:'<File base="file0" ext="ts">'
            to: variable:'b'
            loc: file0:1:21
        -   from: file:'<File base="file0" ext="ts">'
            to: variable:'c'
            loc: file0:1:28
        -   from: file:'<File base="file0" ext="ts">'
            to: function:'foo'
            loc: file0:3:17
        -   from: file:'<File base="file0" ext="ts">'
            to: class:'Foo'
            loc: file0:7:14
        -   from: file:'<File base="file0" ext="ts">'
            to: enum:'Bar'
            loc: file0:11:13
        -   from: file:'<File base="file0" ext="ts">'
            to: interface:'Baz'
            loc: file0:15:18
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
pkg:
    type: module
relation:
    type: export
    extra: false
    items:
        -   from: file:'<File base="file0" ext="js">'
            to: function:'<Anonymous as="Function">'[@loc=file0]
            loc: file0:1:16
            default: true
        -   from: file:'<File base="file1" ext="js">'
            to: function:'<Anonymous as="Function">'[@loc=file1]
            loc: file1:1:16
            default: true
        -   from: file:'<File base="file2" ext="js">'
            to: function:'<Anonymous as="Function">'[@loc=file2]
            loc: file2:1:16
            default: true
        -   from: file:'<File base="file3" ext="js">'
            to: function:'<Anonymous as="Function">'[@loc=file3]
            loc: file3:1:16
            default: true
        -   from: file:'<File base="file4" ext="js">'
            to: class:'<Anonymous as="Class">'[@loc=file4]
            loc: file4:1:16
            default: true
        -   from: file:'<File base="file5" ext="ts">'
            to: class:'<Anonymous as="Class">'[@loc=file5]
            loc: file5:2:16
            default: true
        -   from: file:'<File base="file6" ext="ts">'
            to: interface:'Foo'
            loc: file6:2:16
            default: true
```

###### Default export identifier and assignment expressions

```js
const a = 1;
export default a;
```

```js
let a = 1;
export default a++;
/**
 * In the self update case, the variable `a` is exported first,
 * then be incremented, so the exported value would be 1,
 * and in following places in this file, `a` becomes 2.
 */
```

```yaml
name: Default export identifier and assignment expressions
pkg:
    type: module
relation:
    type: export
    extra: false
    items:
        -   from: file:'<File base="file0" ext="js">'
            to: variable:'a'[@loc=file0]
            loc: file0:2:16
        -   from: file:'<File base="file1" ext="js">'
            to: variable:'a'[@loc=file1]
            loc: file1:2:16
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
            kind: var
            negative: true
relation:
    type: export
    items:
        -   from: file:'<File base="index" ext="ts">'
            to: type alias:'T'
            loc: file3:1:9
        -   from: file:'<File base="index" ext="ts">'
            to: interface:'I'
            loc: file3:1:12
        -   from: file:'<File base="index" ext="ts">'
            to: class:'<Anonymous as="Class">'
            loc: file3:3:9
            alias: C
        -   from: file:'<File base="index" ext="ts">'
            to: class:'Foo'
            loc: file3:9:9
            default: true
```

###### Reexports: Make default export

`export {default} from '...'` is demonstrated in the previous
example. This example shows how to use renaming to convert a
named export into default export.

```js
export const a = 1;
```

```js
export {a as default} from './file0.mjs';
```

[//]: # (@formatter:off)
```js
export {a as 'default'} from './file0.mjs';
/**
 * The default export still works even for string literal
 * that can be evaluated as `default`.
 */
```

[//]: # (@formatter:on)

```yaml
name: Reexports make default export
pkg:
    type: module
relation:
    type: export
    items:
        -   from: file:'<File base="file1" ext="mjs">'
            to: variable:'a'
            loc: file1:1:9
            default: true
        -   from: file:'<File base="file2" ext="mjs">'
            to: variable:'a'
            loc: file2:1:9
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
        -   from: file:'<File base="file0" ext="ts">'
            to: class:'C'[@loc=file0]
            loc: file0:9:14
            alias: Foo
            kind: type
        -   from: class:'C'[@loc=file0]
            to: variable:'obj'
            loc: file1:4:10
            type: type
        -   from: class:'C'[@loc=file1]
            to: class:'C'[@loc=file0]
            loc: file1:7:17
            type: extend
            negative: true
```

###### Auto-infer based on context

```ts
const foo = 1;

interface foo {
    /* Empty */
}

// Both variable foo and interface foo are exported
export {foo};
```

```ts
import {foo} from './file0';

console.log(foo);

let bar: foo;
```

```yaml
name: Auto-infer based on context
relation:
    type: export
    extra: false
    items:
        -   from: file:'<File base="file0" ext="ts">'
            to: variable:'foo'
            loc: file0:8:9
        -   from: file:'<File base="file0" ext="ts">'
            to: interface:'foo'
            loc: file0:8:9
        -   from: file:'<File base="file1" ext="ts">'
            to: variable:'foo'
            loc: file1:3:13
            type: use
        -   from: interface:'foo'
            to: variable:'bar'
            loc: file1:5:10
            type: type
```

[//]: # (#### Semantic: CJS Export)

#### Syntax: TypeScript Legacy Export

```text
ExportAssignment:
    `export` `=` IdentifierReference `;`
```

This syntax is still supported by TypeScript for backward
compatibility and cannot be used when targeting at ECMAScript
modules.

##### Examples

###### TypeScript legacy export

```ts
export = Foo;

class Foo {
    /* Empty */
}
```

```yaml
name: TypeScript legacy export
relation:
    type: export
    extra: false
    items:
        -   from: file:'<File base="file0" ext="ts">'
            to: class:'Foo'
            loc: 5:10
```

#### Syntax: TypeScript Namespace Exports

```text
ExportNamespaceElement:
    `export` VariableStatement
    `export` LexicalDeclaration
    `export` FunctionDeclaration
    `export` GeneratorDeclaration
    `export` ClassDeclaration
    `export` InterfaceDeclaration
    `export` TypeAliasDeclaration
    `export` EnumDeclaration
    `export` NamespaceDeclaration
    `export` AmbientDeclaration
    `export` ImportAliasDeclaration
```

##### Examples

###### Namespace exports

```ts
namespace X {
    export const a = 1;
    export const b = () => {
        /* Empty */
    }

    export function c() {
        /* Empty */
    }

    export function* d() {
        /* Empty */
    }

    export class E {
        /* Empty */
    }

    export interface F {
        /* Empty */
    }

    export type g = number;

    export enum H {
        /* Empty */
    }

    export namespace Y {
        export import i = X.a;
    }
}
```

```yaml
name: Namespace exports
relation:
    type: export
    extra: false
    items:
        -   from: namespace:'X'
            to: variable:'a'
            loc: 2:18
        -   from: namespace:'X'
            to: function:'b'
            loc: 3:18
        -   from: namespace:'X'
            to: function:'c'
            loc: 7:21
        -   from: namespace:'X'
            to: function:'d'
            loc: 11:22
        -   from: namespace:'X'
            to: class:'E'
            loc: 15:18
        -   from: namespace:'X'
            to: interface:'F'
            loc: 19:22
        -   from: namespace:'X'
            to: type alias:'g'
            loc: 23:17
        -   from: namespace:'X'
            to: enum:'H'
            loc: 25:17
        -   from: namespace:'X'
            to: namespace:'Y'
            loc: 29:22
        -   from: namespace:'Y'
            to: variable:'a'
            loc: 30:16
```
