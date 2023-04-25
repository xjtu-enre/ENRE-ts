## Entity: Property

A `Property Entity` is a key-value pair in an object or a TypeScript subtype.

### Supported Patterns

```yaml
name: Property declaration
```

#### Syntax: Object Property Definitions

```text
ObjectLiteral :
    `{` `}`
    `{` PropertyDefinitionList `}`
    `{` PropertyDefinitionList `,` `}`

PropertyDefinitionList :
    PropertyDefinition
    PropertyDefinitionList `,` PropertyDefinition

PropertyDefinition :
    IdentifierReference
    CoverInitializedName /* For secondary syntax only */
    PropertyName `:` AssignmentExpression
    MethodDefinition
    `...` AssignmentExpression

PropertyName :
    LiteralPropertyName
    ComputedPropertyName

LiteralPropertyName :
    IdentifierName
    StringLiteral
    NumericLiteral

ComputedPropertyName :
    `[` AssignmentExpression `]`

CoverInitializedName :
    IdentifierReference Initializer

Initializer :
    `=` AssignmentExpression

MethodDefinition :
    ClassElementName `(` UniqueFormalParameters `)` `{` FunctionBody `}`
    GeneratorMethod
    AsyncMethod
    AsyncGeneratorMethod
    `get` ClassElementName `(` `)` `{` FunctionBody `}`
    `set` ClassElementName `(` PropertySetParameterList `)` `{` FunctionBody `}`
```

Declarations derived by `MethodDefinitions` are categorized as `Method Entity`, continue reading [correlated part](./method.md#object-literal-method-declarations) to learn more.

##### Examples

###### Object literal property declarations

```js
const a = 1;

const b = {
    a,
    b: 'a property',
    'not-a-valid-identifier': 1,
    111: 1,
}
```

```yaml
name: Object literal properties declarations
entity:
    type: property
    extra: false
    items:
        -   name: a
            qualified: b.a
            loc: 4:5
        -   name: b
            qualified: b.b
            loc: 5:5
        -   name: <Modified raw="not-a-valid-identifier" as="StringLiteral">
            qualified: b.'not-a-valid-identifier'
            loc: 6:5
        -   name: <Modified raw="111" as="NumericLiteral" value="111">
            qualified: b.'111'
            loc: 7:5
```

#### Syntax: TypeScript Interface Property Definitions

```text
ObjectType :
    `{` TypeBody `}`

TypeBody :
    TypeMemberList [`;`]
    TypeMemberList [`,`]

TypeMemberList :
    TypeMember
    TypeMemberList `;` TypeMember
    TypeMemberList `,` TypeMember

TypeMember :
    PropertySignature
    CallSignature
    ConstructSignature
    IndexSignature
    MethodSignature

PropertySignature :
    PropertyName [`?`] [TypeAnnotation]

CallSignature :
    [TypeParameters] ( ParameterList ) [TypeAnnotation]

ConstructorType :
    `new` [TypeParameters] `(` [ParameterList] `)` [TypeAnnotation]

IndexSignature :
    `[` BindingIdentifier `:` string `]` TypeAnnotation
    `[` BindingIdentifier `:` number `]` TypeAnnotation

MethodSignature :
    PropertyName `?` CallSignature

TypeAnnotation :
    `:` Type
```

##### Examples

###### Interface properties

If a property omits its `TypeAnnotation` part, the `Any` type is inferred.

```ts
interface Point {
    x: number;
    y: number;
    z?: number,     // Semicolon and comma are both valid
    data,           // Implicitly has an `any` type
    distance: (p: Point) => number,
}
```

```yaml
name: Interface properties
entity:
    type: property
    extra: false
    items:
        -   name: x
            qualified: Point.x
            loc: 2:5
            signature: property
        -   name: y
            qualified: Point.y
            loc: 3:5
            signature: property
        -   name: z
            qualified: Point.z
            loc: 4:5
            signature: property
        -   name: data
            qualified: Point.data
            loc: 5:5
            signature: property
        -   name: distance
            qualified: Point.distance
            loc: 6:5
            signature: property
```

###### Interface property name corner cases

```ts
interface Foo {
    // String literal as property name
    'public': number,
    // Numeric literal as property name
    123.456: number,
    0b101: number,

    // Content of string literal cannot be the same as a numeric literal
    1e2: number,
    '100': string,
}
```

```yaml
name: Interface property name corner cases
entity:
    type: property
    items:
        -   name: <Modified raw="public" as="StringLiteral">
            loc: 3:5:8
        -   name: <Modified raw="123.456" as="NumericLiteral" value="123.456">
            loc: 5:5:7
        -   name: <Modified raw="0b101" as="NumericLiteral" value="5">
            loc: 6:5:5
```

###### Interface function and method properties

```ts
/**
 * This is not an actual case that can be implemented in JS
 * level, just for syntax demostration.
 */
interface Foo {
    (x: number, y: number): number;

    /**
     * Call signature, which lacks return-type annotation,
     * implicitly has an 'any' return type.
     * (This is a TSError in strict mode)
     *
     * This equals to (): any.
     */
    ();

    <T>(x: T, y: T): T;

    <T, U>(a: T[], f: (x: T) => U): U[];

    new<T, U, R>(p0: T, p1: U): R;

    foo(x: number, y: number): number;

    'async'(): string;

    123(): number;
}
```

```yaml
name: Interface function and method properties
entity:
    type: property
    extra: false
    items:
        -   name: <Anonymous as="CallableSignature">
            loc: 6:5:0
            signature: call
        -   name: <Anonymous as="CallableSignature">
            loc: 15:5:0
            signature: call
        -   name: <Anonymous as="CallableSignature">
            loc: 17:5:0
            signature: call
        -   name: <Anonymous as="CallableSignature">
            loc: 19:5:0
            signature: call
        -   name: <Anonymous as="CallableSignature">
            loc: 21:5:0
            signature: constructor
        -   name: foo
            qualified: Foo.foo
            loc: 23:5
            signature: method
        -   name: <Modified raw="async" as="StringLiteral">
            loc: 25:5:7
            signature: method
        -   name: <Modified raw="123" as="NumericLiteral" value="123">
            loc: 27:5:3
            signature: method
```

###### Practical interface function properties

Functions in JavaScript are objects too, which makes appended properties available. This allows a function identifier to be not only called with `()` but also be dot referenced using `.`.

Object with call signatures can be typed as follows.

```ts
interface Distance {
    (x1: number, y1: number, x2: number, y2: number): number;

    comment: 'This function returns distance between two 2D points.';
}

// JS implementation
const distance: Distance = Object.assign(
    (x1: number, y1: number, x2: number, y2: number) => ((x2 - x1) ^ 2 + (y2 - y1) ^ 2) ^ 0.5,
    {comment: 'This function returns distance between two 2D points.'} as const,
)

// Usage
distance(0, 0, 1, 1);
console.log(distance.comment);
```

```yaml
name: Interface with property and call signature
entity:
    type: property
    items:
        -   name: <Anonymous as="CallableSignature">
            loc: 2:5
            signature: call
        -   name: comment
            qualified: Distance.comment
            loc: 4:5
            signature: property
```

###### Interface index properties

```ts
interface ArrayOfNumber {
    [i: number]: number;
}

interface KVPair {
    [k: string]: any;
}
```

```yaml
name: Interface index properties
entity:
    type: property
    extra: false
    items:
        -   name: <Anonymous as="NumberIndexSignature">
            loc: 2:5
            signature: index
        -   name: <Anonymous as="StringIndexSignature">
            loc: 6:5
            signature: index
```

#### Syntax: TypeScript Object Type Literal Property Definitions

```text
(See previous section)
```

##### Examples

###### Object type literal properties

```ts
type Point = {
    x: number;
    y: number;
};
```

```yaml
name: Object type literal properties
entity:
    type: property
    extra: false
    items:
        -   name: x
            qualified: Point.x
            loc: 2:5
        -   name: y
            qualified: Point.y
            loc: 3:5
```

### Properties

| Name | Description | Type | Default |
|------|-------------|:----:|:-------:|
