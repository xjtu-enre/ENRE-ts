## Relation: Export

An `Export Relation` establishes a link between a `Package Entity` or `File Entity` and any other kinds of entity that
the latter one is exported so that other files can import and use.

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
        -   from: file:'<File file0.ts>'
            to: variable:'variable'
            loc: file0:21:9
            kind: any
        -   from: file:'<File file0.ts>'
            to: function:'func'
            loc: file0:21:19
            kind: any
        -   from: file:'<File file0.ts>'
            to: class:'Class'
            loc: file0:21:25
            kind: any
        -   from: file:'<File file0.ts>'
            to: type alias:'OptionalNumber'
            loc: file0:21:32
            kind: any
        -   from: file:'<File file0.ts>'
            to: enum:'Enum'
            loc: file0:21:48
            kind: any
        -   from: file:'<File file0.ts>'
            to: interface:'Interface'
            loc: file0:21:54
            kind: any
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
entity:
    type: alias
    extra: false
    items:
        -   name: V
            loc: 22:17
        -   name: F
            loc: 23:13
        -   name: C
            loc: 24:14
        -   name: N
            loc: 25:23
        -   name: E
            loc: 26:13
        -   name: I
            loc: 27:18
relation:
    type: export
    extra: false
    items:
        -   from: file:'<File file0.ts>'
            to: variable:'variable'
            loc: file0:22:5
        -   from: alias:'V'
            to: variable:'variable'
            loc: file0:22:17
            type: aliasof
        -   from: file:'<File file0.ts>'
            to: function:'func'
            loc: file0:23:5
        -   from: alias:'F'
            to: function:'func'
            loc: file0:23:13
            type: aliasof
        -   from: file:'<File file0.ts>'
            to: class:'Class'
            loc: file0:24:5
        -   from: alias:'C'
            to: class:'Class'
            loc: file0:24:14
            type: aliasof
        -   from: file:'<File file0.ts>'
            to: type alias:'OptionalNumber'
            loc: file0:25:5
        -   from: alias:'N'
            to: type alias:'OptionalNumber'
            loc: file0:25:23
            type: aliasof
        -   from: file:'<File file0.ts>'
            to: enum:'Enum'
            loc: file0:26:5
        -   from: alias:'E'
            to: enum:'Enum'
            loc: file0:26:13
            type: aliasof
        -   from: file:'<File file0.ts>'
            to: interface:'Interface'
            loc: file0:27:5
        -   from: alias:'I'
            to: interface:'Interface'
            loc: file0:27:18
            type: aliasof
```

###### Renamed export: Rename to a string literal

The spec supports rename an export to a string literal, and it has to be renamed again to a valid identifier whiling
importing, continue reading [the import side](./import.md#named-import-rename-string-literals-to-valid-identifiers) to
learn how to do that.

However, neither WebStorm's parser nor TypeScript support this feature.

```js
const variable = 0;

export {variable as
'a-not-valid-identifier'
}
;
```

```yaml
name: Renamed export rename to string literal
pkg:
    type: module
entity:
    type: alias
    extra: false
    items:
        -   name: <Str a-not-valid-identifier>
            loc: 3:21
relation:
    type: export
    extra: false
    items:
        -   from: file:'<File file0.js>'
            to: variable:'variable'
            loc: file0:3:9
        -   from: alias:'<Str a-not-valid-identifier>'
            to: variable:'variable'
            loc: file0:3:21
            type: aliasof
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
        -   from: file:'<File file0.ts>'
            to: variable:'a'
            loc: file0:1:14
        -   from: file:'<File file0.ts>'
            to: variable:'b'
            loc: file0:1:21
        -   from: file:'<File file0.ts>'
            to: variable:'c'
            loc: file0:1:28
        -   from: file:'<File file0.ts>'
            to: function:'foo'
            loc: file0:3:17
        -   from: file:'<File file0.ts>'
            to: class:'Foo'
            loc: file0:7:14
        -   from: file:'<File file0.ts>'
            to: enum:'Bar'
            loc: file0:11:13
        -   from: file:'<File file0.ts>'
            to: interface:'Baz'
            loc: file0:15:18
```

###### Default exports

A file can only have one default export.

Some TypeScript elements cannot be exported as default, continue
reading [this issue](https://github.com/microsoft/TypeScript/issues/3792#issuecomment-303526468) to learn more.

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
        -   from: file:'<File file0.js>'
            to: function:'<Anonymous as="Function">'[@loc=file0]
            loc: file0:1:16
            default: true
        -   from: file:'<File file1.js>'
            to: function:'<Anonymous as="Function">'[@loc=file1]
            loc: file1:1:16
            default: true
        -   from: file:'<File file2.js>'
            to: function:'<Anonymous as="Function">'[@loc=file2]
            loc: file2:1:16
            default: true
        -   from: file:'<File file3.js>'
            to: function:'<Anonymous as="Function">'[@loc=file3]
            loc: file3:1:16
            default: true
        -   from: file:'<File file4.js>'
            to: class:'<Anonymous as="Class">'[@loc=file4]
            loc: file4:1:16
            default: true
        -   from: file:'<File file5.ts>'
            to: class:'<Anonymous as="Class">'[@loc=file5]
            loc: file5:2:16
            default: true
        -   from: file:'<File file6.ts>'
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
        -   from: file:'<File file0.js>'
            to: variable:'a'[@loc=file0]
            loc: file0:2:16
            default: true
        -   from: file:'<File file1.js>'
            to: variable:'a'[@loc=file1]
            loc: file1:2:16
            default: true
```

###### Reexports

A file can import-and-export another file's exports in one stop. This suits the scenario that a library exports its
internal symbols in one single `index.js` for other libraries to import.

This does not introduce symbols to the current scope like what an `import` statement would do.

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
 * a not-renamed reexport of `default` will make it still a default export.
 */
export {default} from './file2';
```

```ts
//// index2.ts
export * from './index';
export * as index from './index';
```

```yaml
name: Reexports
entity:
    items:
        -   name: C
            loc: file3:3:20
            type: variable
            kind: var
            # Understand reported this FP
            negative: true
        -   name: C
            loc: file3:3:20
            type: alias
        -   name: index
            loc: file4:2:13
            type: alias
relation:
    type: export
    items:
        -   from: file:'<File index.ts>'
            to: type alias:'T'
            loc: file3:1:9
        -   from: file:'<File index.ts>'
            to: interface:'I'
            loc: file3:1:12
        -   from: file:'<File index.ts>'
            to: class:'<Anonymous as="Class">'
            loc: file3:3:9
        -   from: alias:'C'
            to: class:'<Anonymous as="Class">'
            loc: file3:3:20
            type: aliasof
        -   from: file:'<File index.ts>'
            to: class:'Foo'
            loc: file3:9:9
            default: true
        -   from: file:'<File index2.ts>'
            to: file:'<File index.ts>'
            loc: file4:1:8
            all: true
        -   from: file:'<File index2.ts>'
            to: file:'<File index.ts>'
            loc: file4:2:8
            all: true
        -   from: alias:'index'
            to: file:'<File index.ts>'
            loc: file4:2:13
            type: aliasof
```

###### Reexport nothing

```js
console.log('Side effect!');
export const a = 1;
```

```js
export {} from './file0.js';
/**
 * Though `a` is not re-exported, any side-effect would still take place.
 *
 * Equivalent to `import './file0.js'`
 */
```

```yaml
name: Reexport nothing
relation:
    type: export
    items:
        -   from: file:'<File file1.js>'
            to: file:'<File file0.js>'
            loc: file1:1:8
```

###### Reexports: Make default export

`export {default} from '...'` is demonstrated in the previous example. This example shows how to use renaming to convert
a named export into default export.

```js
export const a = 1;
```

```js
export {a as default} from './file0.js';
```

```js
export {a as
'default'
}
from
'./file0.js';
/**
 * The default export still works even for string literal
 * that can be evaluated as `default`.
 */
```

```yaml
name: Reexports make default export
pkg:
    type: module
relation:
    type: export
    items:
        -   from: file:'<File file1.js>'
            to: variable:'a'
            loc: file1:1:9
            default: true
        -   from: file:'<File file2.js>'
            to: variable:'a'
            loc: file2:1:9
            default: true
```

###### Import and then export

It is also possible to import a symbol and then export it.

```js
export const a = 1;
```

```js
import {a} from './file0.js'

console.log(a);

export {a};
/**
 * This is equivalent to reexport statement from the prospective of exporting,
 * but this pattern also grant you the local accessibility to variable `a`.
 */
```

```yaml
name: Import and then export
relation:
    items:
        -   from: file:'<File file1.js>'
            to: variable:'a'
            loc: file1:1:9
            type: import
        -   from: file:'<File file1.js>'
            to: variable:'a'
            loc: file1:4:9
            type: export
```

<!--###### Export assignment expressions-->

#### Semantic: TypeScript Type-Only Export

Start
from [TypeScript 3.8](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export)
it supports type-only export, which adds `type` after `export` to only export types that works on design-time in type
contexts and will be totally removed while compiling.

Note that as mentioned in [entity/class](../entity/class.md#semantic-typescript-class-types), a class definition creates
a value and a type. If the type is exported exclusively (or imported exclusively), that symbol can only be used in type
contexts, which means that you cannot `extends` that symbol, where a value is expected.

> Continue reading [this PR](https://github.com/microsoft/TypeScript/pull/35200#issue-525173080) to learn more about the
> design decision.

<!-- TODO: Follow up this PR: https://github.com/microsoft/TypeScript/pull/36092/-->

Also start
from [TypeScript 5.0](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/#support-for-export-type), it
supports type-only export to be used in the namespace importing/re-exporting context.

> Continue reading [this PR](https://github.com/microsoft/TypeScript/pull/52217) to learn more about the design
> decision.

##### Examples

###### Type-only export

```ts
class C {
    /* Empty */
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
        -   from: file:'<File file0.ts>'
            to: class:'C'[@loc=file0]
            loc: file0:5:14
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

###### Type-only re-export

```ts
export class Foo { /* Empty */
}

export interface Bar { /* Empty */
}
```

```ts
export type * from './file0.ts';
/**
 * Equivalent to:
 * export type Foo from './file0.ts';
 * export type Bar from './file0.ts';
 */

export type * as Types from './file0.ts';
```

```ts
import {Foo, Bar, Types} from 'file1.ts';

// Usages
const FooObj0: Foo = {};
const FooObj1: Types.Foo = {};
const BarObj: Types.Bar = {};
```

```yaml
name: Type-only re-export
relation:
    type: export
    items:
        -   from: file:'<File file1.ts>'
            to: file:'<File file0.ts>'
            loc: file1:1:13
            kind: type
            all: true
        -   from: file:'<File file1.ts>'
            to: file:'<File file0.ts>'
            loc: file1:8:13
            kind: type
            all: true
        -   from: alias:'Types'
            to: file:'<File file0.ts>'
            loc: file1:8:18
            type: aliasof
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
        -   from: file:'<File file0.ts>'
            to: variable:'foo'
            loc: file0:8:9
        -   from: file:'<File file0.ts>'
            to: interface:'foo'
            loc: file0:8:9
        -   from: file:'<File file1.ts>'
            to: variable:'foo'
            loc: file1:3:13
            type: use
        -   from: interface:'foo'
            to: variable:'bar'
            loc: file1:5:10
            type: type
```

<!--#### Semantic: CJS Export-->

#### Syntax: TypeScript Legacy Export

```text
ExportAssignment:
    `export` `=` IdentifierReference `;`
```

This syntax is still supported by TypeScript for backward compatibility and cannot be used when targeting at ECMAScript
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
        -   from: file:'<File file0.ts>'
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

### Properties

| Name      | Description                                                       |   Type    | Default  |
|-----------|-------------------------------------------------------------------|:---------:|:--------:|
| kind      | The export kind.                                                  | `'any'` \ | `'type'` | `'any'` |
| isDefault | Indicates a default export                                        | `boolean` | `false`  |
| isAll     | Indicates a file export file relation exports all of its symbols. | `boolean` | `false`  |
