## Relation: Type

A `Type Relation` establishes a link between a value entity that accepts `TypeAnnotation`
and any other type entities which appear on the typing context.

### Supported Patterns

```yaml
name: Relation type
```

#### Supplemental: The Type

```text
Type :
    UnionOrIntersectionOrPrimaryType
    FunctionType
    ConstructorType

UnionOrIntersectionOrPrimaryType :
    UnionType
    IntersectionOrPrimaryType

IntersectionOrPrimaryType :
    IntersectionType
    PrimaryType

PrimaryType :
    ParenthesizedType
    PredefinedType
    TypeReference
    ObjectType
    ArrayType
    TupleType
    TypeQuery
    ThisType

...

More on https://github.com/microsoft/TypeScript/blob/main/doc/spec-ARCHIVED.md#a1-types
```

> This relation is only established when the type entity is used as is (directly or
> indirectly), that is, no utility type wrapping, no union type, no intersection type,
> a `Use Relation` is instead established in these circumstances.

#### Syntax: Type Variables / Fields / Parameters

```text
LexicalBinding :
    SimpleLexicalBinding
    DestructuringLexicalBinding

SimpleLexicalBinding:
    BindingIdentifier [TypeAnnotation] [Initializer]

DestructuringLexicalBinding:
    BindingPattern [TypeAnnotation] [Initializer]

RestParameter:
    `...` BindingIdentifier [TypeAnnotation]

SetAccessor:
    `set` PropertyName `(` BindingIdentifierOrPattern [TypeAnnotation] `)` `{` FunctionBody `}`
```

##### Examples

###### Class in typing context

```ts
class Foo {
    field0: number;
}

let foo: Foo;

class Bar {
    field0: Foo;
}

function baz(param0: Foo) {
    /* Empty */
}
```

```yaml
name: Class in typing context
relation:
    type: type
    items:
        -   from: class:'Foo'
            to: variable:'foo'
            loc: file0:5:10
        -   from: class:'Foo'
            to: field:'Bar.field0'
            loc: file0:8:13
        -   from: class:'Foo'
            to: parameter:'baz.param0'
            loc: file0:11:22
```

###### Enum in typing context

```ts
enum Foo {
    bar,
    baz,
}

let foo: Foo;

class Bar {
    field0: Foo;
}

function baz(param0: Foo) {
    /* Empty */
}
```

```yaml
name: Enum in typing context
relation:
    type: type
    extra: false
    items:
        -   from: enum:'Foo'
            to: variable:'foo'
            loc: file0:6:10
        -   from: enum:'Foo'
            to: field:'Bar.field0'
            loc: file0:9:13
        -   from: enum:'Foo'
            to: parameter:'baz.param0'
            loc: file0:12:22
```

###### Interface in typing context

```ts
interface Foo {
    field0: number;
}

let foo: Foo;

class Bar {
    field0: Foo;
}

function baz(param0: Foo) {
    /* Empty */
}
```

```yaml
name: Interface in typing context
relation:
    type: type
    items:
        -   from: interface:'Foo'
            to: variable:'foo'
            loc: file0:5:10
        -   from: interface:'Foo'
            to: field:'Bar.field0'
            loc: file0:8:13
        -   from: interface:'Foo'
            to: parameter:'baz.param0'
            loc: file0:11:22
```

###### Type alias in typing context

```ts
type foo = number | undefined;

let bar: foo;

class Baz {
    field0: foo;
}

function func(param0: foo) {
    /* Empty */
}
```

```yaml
name: Type alias in typing context
relation:
    type: type
    extra: false
    items:
        -   from: type alias:'foo'
            to: variable:'bar'
            loc: 3:10
        -   from: type alias:'foo'
            to: field:'Baz.field0'
            loc: 6:13
        -   from: type alias:'foo'
            to: parameter:'func.param0'
            loc: 9:23
```

###### Type parameter in typing context

```ts
function foo<T>(param0: T) {
    let bar: T;

    class Baz {
        field0: T;
    }

    function func(param0: T) {
        /* Empty */
    }
}
```

```yaml
name: Type parameter in typing context
relation:
    type: type
    extra: false
    items:
        -   from: type parameter:'foo.T'
            to: parameter:'foo.param0'
            loc: 1:25
        -   from: type parameter:'foo.T'
            to: variable:'foo.bar'
            loc: 2:14
        -   from: type parameter:'foo.T'
            to: field:'foo.Baz.field0'
            loc: 5:17
        -   from: type parameter:'foo.T'
            to: parameter:'foo.func.param0'
            loc: 8:27
```

#### Syntax: Type Properties

```text
PropertySignature:
    PropertyName [`?`] [TypeAnnotation]

IndexSignature:
    `[` BindingIdentifier `:` `string` `]` TypeAnnotation
    `[` BindingIdentifier `:` `number` `]` TypeAnnotation
```

##### Examples

###### TODO

```ts

```

```yaml
name: TODO
```

#### Syntax: Type The Return Type of Callables

```text
GetAccessor:
    `get` PropertyName `(` `)` [TypeAnnotation] `{` FunctionBody `}`
    
CallSignature:
    [TypeParameters] `(` [ParameterList] `)` [TypeAnnotation]
```

##### Examples

###### Class type callables

```ts
class Foo {
    field0: Foo;
}

function foo(): Foo {
    return new Foo();
}

class Bar {
    constructor(public field0: Foo): Foo {
        // TSError: Type annotation cannot appear on a constructor declaration.
    }

    get foo(): Foo {
        return this.field0
    };
}
```

```yaml
name: Class type callables
relation:
    type: type
    items:
        -   from: class:'Foo'
            to: function:'foo'
            loc: file0:5:17
        -   from: class:'Foo'
            to: field:'Bar.field0'
            loc: file0:10:32
        -   from: class:'Foo'
            to: method:'Bar.constructor'
            loc: file0:10:38
            negative: true
        -   from: class:'Foo'
            to: method:'Bar.foo'[@loc=14]
            loc: file0:14:16
```

#### Syntax: Lookup Types

```text
(guessed)
TypeAnnotation :
    Type [`[` Index `]`]
    `Pick` `<` Type `,` StringLiterals `>`
    EnumIdentifier `.` EnumMemberIdentifier
```

##### Examples

###### Index based type lookup

```ts
interface Foo {
    prop0: number;
    prop1: number;
}

enum Bar {
    a,
    b,
    c,
    d,
}

class Baz {
    field0: number;

    method0(param0: string): number {
        return 0;
    }
}

let foo0: Foo['prop0'];

// Type lookup with more than one property is not extracted yet.
let foo1: Foo['prop0' | 'prop1'];

let bar: Bar.a;

let baz0: Baz['field0'];

let baz1: Baz['method0'];
```

```yaml
name: Index based type lookup
relation:
    type: type
    items:
        -   from: property:'Foo.prop0'
            to: variable:'foo0'
            loc: 21:11
        -   from: interface:'Foo'
            to: variable:'foo0'
            loc: 21:11
            negative: true
        -   from: enum member:'Bar.a'
            to: variable:'bar'
            loc: 26:10
        -   from: field:'Baz.field0'
            to: variable:'baz0'
            loc: 28:11
        -   from: class:'Baz'
            to: variable:'baz0'
            loc: 28:11
            negative: true
        -   from: method:'Baz.method0'
            to: variable:'baz1'
            loc: 30:11
```

###### `Pick` based type lookup

Utility type `Pick` only works on object like type and returns a subtype of that object
like type, which is still an object like type (not the bare type). Hence, this is not
extracted either.

```ts
//// @no-test
interface Foo {
    prop0: number;
    prop1: number;
}

class Baz {
    field0: number;

    method0(param0: string): number {
        return 0;
    }
}

let foo0: Pick<Foo, 'prop0'>;   // {prop0: number}

let foo1: Pick<Foo, 'prop0' | 'prop1'>;

let baz0: Pick<Baz, 'field0'>;  // {field0: number)

let baz1: Pick<Baz, 'method0'>; // {method0: (param0: string) => number}
```

### Properties

| Name | Description | Type | Default |
|------|-------------|:----:|:-------:|
