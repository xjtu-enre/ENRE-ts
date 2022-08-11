## Entity: Namespace

A `Namespace Entity` is a named container for values and types
providing a hierarchical mechanism for organizing code and
declarations.

> Knowing how TypeScript transpiles namespaces into JavaScript
> code helps to understand the underlying mechanism of
> encapsulation, exports, and declaration merging.
> See [this section](https://github.com/microsoft/TypeScript/blob/main/doc/spec-ARCHIVED.md#106-code-generation)
> .

### Supported Patterns

```yaml
name: Namespace declaration
```

#### Syntax: Namespace Definitions

```text
NamespaceDeclaration:
    `namespace` IdentifierPath `{` NamespaceBody `}`

IdentifierPath:
    BindingIdentifier
    IdentifierPath `.` BindingIdentifier
```

##### Examples

###### Simple namespace declaration

```ts
namespace X {
    /* Empty */
}
```

```yaml
name: Simple namespace declaration
entity:
    type: namespace
    extra: false
    items:
        -   name: X
            loc: 1:11
```

###### Use identifier path

Using identifier path to declare a namespace is equivalent to
declare multiple namespaces that hierarchically export its
descendants.

```ts
namespace X.Y.Z {
    /* Empty */
}

// Is equivalent to
// namespace X {
//     export namespace Y {
//         export namespace Z {
//             /* Empty */
//         }
//     }
// }
```

```yaml
name: Namespace identifier path
entity:
    type: namespace
    extra: false
    items:
        -   name: X
            qualified: X
            loc: file0:1:11
        -   name: Y
            qualified: X.Y
            loc: file0:1:13
        -   name: Z
            qualified: X.Y.Z
            loc: file0:1:15
```

###### Access namespace's children

```ts
namespace A {
    export type A = number
}

interface A {
    A: string
}

type b = A['A']   // interface A - property A
type c = A.A      // namespace A - type alias A
```

```yaml
name: Access children of namespace
entity:
    items:
        -   name: A
            loc: 1:11
            type: namespace
        -   name: A
            qualified: A.A
            loc: 2:17
            type: type alias
        -   name: A
            loc: 5:11
            type: interface
        -   name: A
            qualified: A.A
            loc: 6:5
            type: property
relation:
    type: use
    items:
        -   from: file:'file0'
            to: property:'A.A'
            loc: 9:10
        -   from: file:'file0'
            to: type alias:'A.A'
            loc: 10:10
```

#### Semantic: Declaration Merging

`namespace` is **open-ended**, which means namespaces with the
same qualified name under the same scope will be merged into a
single one namespace.

Namespace can not only be merged with another namespace
declaration, but also function, class, or enum declaration.

##### Examples

###### Single file namespace declaration merging

```ts
namespace X {
    export const a = 1;
}

namespace X {
    export const b = 2;
}

// Usage
// const x: typeof X = {a: 1, b: 2};
```

```yaml
name: Single file namespace declaration merging
entity:
    type: namespace
    extra: false
    items:
        -   name: X
            loc: 1:11
            type: namespace
            declarations:
                - 5:11
        -   name: a
            qualified: X.a
            loc: 2:18
            type: variable
            kind: const
        -   name: b
            qualified: X.b
            loc: 6:18
            type: variable
            kind: const
```

###### Multiple files namespace declaration merging

```ts
namespace X {
    export const a = 1;
}
```

```ts
namespace X {
    export const b = 2;
}
```

```yaml
name: Multiple files namespace declaration merging
entity:
    type: namespace
    extra: false
    items:
        -   name: X
            loc: 1:11
            type: namespace
            declarations:
                - file1:1:11
        -   name: a
            qualified: X.a
            loc: 2:18
            type: variable
            kind: const
        -   name: b
            qualified: X.b
            loc: 2:18
            type: variable
            kind: const
```

###### Redeclare block-scope variable

Variable declarations with `var` can declare the same identifier
multiple times inter-/intra-namespace, whereas `let` and `const`
do not satisfy this.

```ts
namespace X {
    export var a = 1;
    // export let b = 1;
    // export const c = 1;
}

X.a // 1

namespace X {
    export var a = 2;
    // export let b = 2;
    // export const c = 2;
}

X.a // 2
```

```yaml
name: Redeclare block-scope variable
entity:
    type: variable
    extra: false
    items:
        -   name: a
            qualified: X.a
            loc: 2:16
relation:
    type: set
    extra: false
    items:
        -   from: namespace:'X'
            to: variable:'a'
            loc: 2:16
            init: true
        -   from: namespace:'X'
            to: variable:'a'
            loc: 10:16
            init: true
```

###### Merge namespace and function

> When merging a non-ambient function or class declaration and a
> non-ambient namespace declaration, the function or class
> declaration must be located prior to the namespace declaration
> in
> the same source file. This ensures that the shared object
> instance is created as a function object. (While it is possible
> to add properties to an object after its creation, it is not
> possible to make an object "callable" after the fact.)

```ts
interface Point {
    x: number;
    y: number;
}

function point(x: number, y: number): Point {
    return {x: x, y: y};
}

namespace point {
    export var origin = point(0, 0);

    export function equals(p1: Point, p2: Point) {
        return p1.x == p2.x && p1.y == p2.y;
    }
}

var p1 = point(0, 0);
var p2 = point.origin;
var b = point.equals(p1, p2);
```

```yaml
name: Merge namespace and function
entity:
    items:
        -   name: point
            loc: 6:10
            type: function
        -   name: point
            loc: 10:11
            type: namespace
        -   name: origin
            qualified: point.origin
            loc: 11:16
            type: variable
            kind: var
        -   name: equals
            qualified: point.equals
            loc: 13:21
            type: function
relation:
    items:
        -   from: file:'file0'
            to: function:'point'
            loc: 18:10
            type: call
        -   from: file:'file0'
            to: variable:'point.origin'
            loc: 19:16
            type: use
        -   from: file:'file0'
            to: function:'point.equals'
            loc: 20:15
            type: call
```

#### Supplemental: Namespace Body

```text
NamespaceBody:
   [NamespaceElements]

NamespaceElements:
    NamespaceElement
    NamespaceElements NamespaceElement

NamespaceElement:
    Statement
    LexicalDeclaration
    FunctionDeclaration
    GeneratorDeclaration
    ClassDeclaration
    InterfaceDeclaration
    TypeAliasDeclaration
    EnumDeclaration
    NamespaceDeclaration
    AmbientDeclaration
    ImportAliasDeclaration
    ExportNamespaceElement

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
