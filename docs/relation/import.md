## Relation: Import

An `Import Relation` establishes a link between a `File Entity` and any other kinds of entity that the latter one is imported for use.

Imported entities are READ ONLY and can only be modified by exporters (exported functions that internally modify the wanted value).

### Supported Patterns

```yaml
name: Import declaration
```

#### Syntax: ESM Imports

```text
ImportDeclaration :
    `import` ImportClause FromClause ;
    `import` ModuleSpecifier ;

ImportClause :
    ImportedDefaultBinding
    NameSpaceImport
    NamedImports
    ImportedDefaultBinding `,` NameSpaceImport
    ImportedDefaultBinding `,` NamedImports

ImportedDefaultBinding :
    ImportedBinding

NameSpaceImport :
    `*` `as` ImportedBinding

NamedImports :
    `{` `}`
    `{` ImportsList `}`
    `{` ImportsList `,` `}`

FromClause :
    `from` ModuleSpecifier

ImportsList :
    ImportSpecifier
    ImportsList `,` ImportSpecifier

ImportSpecifier :
    ImportedBinding
    ModuleExportName `as` ImportedBinding

ModuleSpecifier :
    StringLiteral

ImportedBinding :
    BindingIdentifier
    
ModuleExportName :
    IdentifierName
    StringLiteral
```

In the case where the `ModuleSpecifier` is a relative path to another js file, Node.js expects it is ends with a valid extension, that is, `.js`, `.mjs`, `.cjs`, and `.json`, otherwise Node.js will throw an error `ERR_MODULE_NOT_FOUND`. As for Node.js 18, this can be still addressed by passing `--experimental-specifier-resolution=node` argument to `node`. However, many transpiler (like `babel` and `tsc` from TypeScript) implement an algorithm to try to add an appropriate extension name for a bare specifier. This should not bother static analysis.

##### Examples

###### Imported default binding

```js
const variable = 0;

export default variable;
```

```js
import anyName from './file0.js';

console.log(anyName);   // 0
```

```yaml
name: Imported default binding
pkg:
    type: module
relation:
    type: import
    extra: false
    items:
        -   from: file:'<File base="file1" ext="js">'
            to: variable:'variable'
            loc: file1:1:8
            alias: anyName
```

###### Namespace import

```js
export function func() {
    /* Empty */
}

export class Class {
    /* Empty */
}
```

```js
import * as AWholeModule from './file0.js';
// All exports are packed into a single object

// Usage
AWholeModule.func();
new AWholeModule.Class();
```

```yaml
name: Namespace import
pkg:
    type: module
relation:
    type: import
    extra: false
    items:
        -   from: file:'<File base="file1" ext="js">'
            to: file:'<File base="file0" ext="js">'
            loc: file1:1:13
            alias: AWholeModule
```

###### Named import

```ts
export const variable = 0;

export function func() {
    /* Empty */
}

export class Class {
    /* Empty */
}

export type OptionalNumber = number | undefined;

export default interface Foo {
    /* Empty */
}
```

```ts
import {func, Class, OptionalNumber} from './file0';
```

```ts
import {OptionalNumber as shortName} from './file0';
```

```ts
import {default as Foo} from './file0';
// default import MUST be renamed, since `default` is a reserved word.
```

```ts
import defaultExport, {
    // Named imports can still import the default export
    default as IFoo,
    OptionalNumber,
} from './file0';

let foo: defaultExport;
let bar: IFoo;
```

```ts
import defaultExport, * as AWholeModule from './file0';
// Namespace import still contains the default export

let foo: defaultExport;
let bar: AWholeModule.default;
```

```yaml
name: Named imports
pkg:
    type: module
relation:
    type: import
    extra: false
    items:
        -   from: file:'<File base="file1" ext="ts">'
            to: function:'func'
            loc: file1:1:9
        -   from: file:'<File base="file1" ext="ts">'
            to: class:'Class'
            loc: file1:1:15
        -   from: file:'<File base="file1" ext="ts">'
            to: type alias:'OptionalNumber'
            loc: file1:1:22
        -   from: file:'<File base="file2" ext="ts">'
            to: type alias:'OptionalNumber'
            loc: file2:1:9
            alias: shortName
        -   from: file:'<File base="file3" ext="ts">'
            to: interface:'Foo'
            loc: file3:1:9
            alias: Foo
        -   from: file:'<File base="file4" ext="ts">'
            to: interface:'Foo'
            loc: file4:1:8
            alias: defaultExport
        -   from: file:'<File base="file4" ext="ts">'
            to: interface:'Foo'
            loc: file4:3:5
            alias: IFoo
        -   from: file:'<File base="file4" ext="ts">'
            to: type alias:'OptionalNumber'
            loc: file4:4:5
        -   from: file:'<File base="file5" ext="ts">'
            to: interface:'Foo'
            loc: file5:1:8
        -   from: file:'<File base="file5" ext="ts">'
            to: file:'<File base="file0" ext="ts">'
            loc: file5:1:23
            alias: AWholeModule
```

###### Named import: Rename string literals to valid identifiers

Exports can be renamed to string literals, continue reading [the export part](./export.md#renamed-export-rename-to-a-string-literal) to learn more.

```js
const variable = 0;

export {variable as 'a-not-valid-identifier' };
```

```js
import {'a-not-valid-identifier' as variable} from './file0.js';

console.log(variable);
```

```yaml
name: Named import rename string literal to identifier
pkg:
    type: module
relation:
    type: import
    extra: false
    items:
        -   from: file:'<File base="file1" ext="js">'
            to: variable:'variable'
            loc: file1:1:9
            alias: variable
```

###### Side-effects-only import

Side-effects-only import does not introduce symbols into the current scope. This runs the module's global code, but doesn't actually import any values. This is often used for polyfills, which mutate the global variables.

```js
console.log('Some side-effects...')

export const foo = 0;
```

```js
import './file0.js';
/**
 * 'Some side-effects...' will be printed,
 * whereas `foo` is not available in here.
 */
```

```yaml
name: Side-effects-only import
pkg:
    type: module
relation:
    type: import
    extra: false
    items:
        -   from: file:'<File base="file1" ext="js">'
            to: file:'<File base="file0" ext="js">'
            loc: file1:1:8
```

#### Semantic: ESM Dynamic Import

```text
ImportCall :
    `import` `(` AssignmentExpression `)`
```

The `import()` call, commonly called dynamic import, is a function-like expression that allows loading an ECMAScript module asynchronously and dynamically into a potentially non-module environment.

It returns a promise which fulfills to an object containing all exports from moduleName, with the same shape as a namespace import (`import * as name from moduleName`): an object with `null`prototype, and the default export available as a key named default.

##### Examples

###### Simple dynamic import

```js
export const a = 1;
```

```js
const content = await import('./file0.js'); // {a: 1}
```

```yaml
name: ESM dynamic import
pkg:
    type: module
relation:
    type: import
    extra: false
    items:
        -   from: file:'<File base="file1" ext="js">'
            to: file:'<File base="file0" ext="js">'
            loc: file1:1:7
            alias: content
```

#### Semantic: TypeScript ESM Type-Only Import

> Read [`Relation: Export`](./export.md#semantic-typescript-esm-type-only-export) to learn the export part.

##### Examples

###### Type-only import

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
name: Type-only import
relation:
    type: import
    extra: false
    items:
        -   from: file:'<File base="file1" ext="ts">'
            to: class:'C'[@loc=file0]
            loc: file1:1:14
            alias: Foo
            kind: type
        -   from: class:'C'[@loc=file1]
            to: class:'C'[@loc=file0]
            loc: file1:7:17
            type: extend
            negative: true
```

[//]: # (#### Semantic: CJS Import)

#### Syntax: TypeScript Namespace Imports

```text
ImportAliasDeclaration:
    `import` BindingIdentifier `=` EntityName `;`

EntityName:
    NamespaceName
    NamespaceName `.` IdentifierReference
```

An import declaration can only be used at the top level of a namespace or module.

##### Examples

###### TypeScript namespace import

```ts
namespace X {
    export const a = 1 as const;

    export namespace Y {
        export import b = X.a; // 1
    }
}

import c = X.Y.b; // 1
```

```yaml
name: TypeScript namespace import
relation:
    type: import
    extra: false
    items:
        -   from: namespace:'X.Y'
            to: variable:'X.a'
            loc: file0:5:23
            alias: b
        -   from: file:'<File base="file0" ext="ts">'
            to: variable:'X.a'
            loc: file0:9:8
            alias: c
```

### Properties

| Name | Description | Type | Default |
|------|-------------|:----:|:-------:|
| kind | The import kind. | `'all'` \| `'type'` | `'all'` |
| alias | The alias of the imported item. | `string` | `undefined` |
