## Entity: Field

A `Field Entity` is a public / private *variable* defined inside
a `Class Entity`.

> This entity is named as `field` rather than `property`, which
> is typically used in other languages. Continue
> reading [this discussion](https://stackoverflow.com/a/54851218)
> about our consideration.

### Supported Patterns

```yaml
name: Field declaration
```

#### Syntax: Field Declarations

```text
FieldDefinition :
    MethodDefinition
    ClassElementName [Initializer]

ClassElementName :
    PropertyName
    PrivateIdentifier

PropertyName :
    LiteralPropertyName
    ComputedPropertyName

LiteralPropertyName :
    IdentifierName
    StringLiteral
    NumericLiteral

ComputedPropertyName :
    `[` AssignmentExpression `]`
    
PrivateIdentifier :
    `#` IdentifierName
```

##### Examples

###### Public fields

```js
class Foo {
    a;
    b = 1;

    /**
     * Any unicode character is supported,
     * unless the literal fails the cast towards identifier,
     * this will be the same as an identifier.
     */
    'c';
    '✅';

    /**
     * Numeric literal will firstly be converted to standard
     * number in base 10, then be cast to string as a key.
     */
    3;
    1_000_000;
    1e-3;

    /**
     * Computed key will NOT be extracted by ENRE.
     */
    [`!computed${d}`];
}

/**
 * After instantiating, an instance will contain following fields:
 *
 * foo {
 *   '3': undefined,
 *   '1000000': undefined,
 *   a: undefined,
 *   b: 1,
 *   c: undefined,
 *   '✅': undefined,
 *   '0.001': undefined,
 *   '!computedKey': undefined // Assume d is 'Key'
 * }
 */
```

```yaml
name: Public class fields
entity:
    type: field
    extra: false
    items:
        -   name: a
            qualified: Foo.a
            loc: 2:5
        -   name: b
            qualified: Foo.b
            loc: 3:5
        -   name: <Modified raw="c" as="StringLiteral">
            qualified: Foo.c
            loc: 10:5:3
        -   name: <Modified raw="✅" as="StringLiteral">
            qualified: Foo.'✅'
            loc: 11:5:3
        -   name: <Modified raw="3" as="NumericLiteral" value="3">
            qualified: Foo.'3'
            loc: 17:5:1
        -   name: <Modified raw="1_000_000" as="NumericLiteral" value="1000000">
            qualified: Foo.'1000000'
            loc: 18:5:9
        -   name: <Modified raw="1e-3" as="NumericLiteral" value="0.001">
            qualified: Foo.'0.001'
            loc: 19:5:4
```

###### Private fields

A private field must be declared explicitly before using.

```js
class Foo {
    #bar;
    #baz = 1;

    /**
     * No more other than IdentifierName is allowed
     *
     * e.g.:
     * #'c'
     * #3
     * #[`!computed${d}`]
     *
     * These examples are all INVALID.
     */
}
```

```yaml
name: Private class fields
entity:
    type: field
    extra: false
    items:
        -   name: <Modified raw="bar" as="PrivateIdentifier">
            qualified: Foo.#bar
            loc: 2:5:4
            private: true
        -   name: <Modified raw="baz" as="PrivateIdentifier">
            qualified: Foo.#baz
            loc: 3:5:4
            private: true
```

#### Syntax: Static Fields

```text
ClassElement :
    `static` FieldDefinition `;`
    ...
```

##### Examples

###### Static fields

```js
class Foo {
    static a;
    static #bar;
}
```

```yaml
name: Static class fields
entity:
    type: field
    extra: false
    items:
        -   name: a
            qualified: Foo.a
            loc: 2:12
            static: true
        -   name: <Modified raw="bar" as="PrivateIdentifier">
            qualified: Foo.#bar
            loc: 3:12:4
            static: true
            private: true
```

#### Runtime: Implicitly declare using `this.*`

Public field declarations could be omitted in the up-front of a
class declaration, however, doing so would make the code less
self-document.

##### Examples

###### Implicit field declaration

```js
class Rectangle {
    constructor(height, width) {
        this.height = height;
        this.width = width;
    }
}
```

```yaml
name: Implicit field declaration
entity:
    type: field
    extra: false
    items:
        -   name: height
            qualified: Rectangle.constructor.height
            type: parameter
            loc: 2:17
        -   name: width
            qualified: Rectangle.constructor.width
            type: parameter
            loc: 2:25
        -   name: height
            qualified: Rectangle.height
            loc: 3:14
            implicit: true
        -   name: width
            qualified: Rectangle.width
            loc: 4:14
            implicit: true
```

#### Syntax: TypeScript field accessibility modifiers

```text
ClassElementName :
    [AccessibilityModifier] PropertyName
    PrivateIdentifier
    
AccessibilityModifier :
    `public`
    `protected`
    `private`
```

TypeScript field accessibility modifiers are only enforced at
**compile-time**, and can also be defeated by cast the type of
instances into `any`. In contract, ECMAScript 2019 added private
fields feature that works at **run-time**. ECMAScript private
fields **CANNOT** be modified by TypeScript field accessibility
modifiers.

##### Examples

###### The `public` modifier

Fields modified by `public` can be accessed anywhere, which is
the default behavior.

```ts
class Foo {
    public field0: number;
    field1: number;
}
```

```yaml
name: TS public field modifier
entity:
    type: field
    extra: false
    items:
        -   name: field0
            qualified: Foo.field0
            loc: 2:12
            TSModifier: public
        -   name: field1
            qualified: Foo.field1
            loc: 3:5
            TSModifier: public
```

###### The `protected` modifier

Fields modified by `protected` can be accessed from the base
class and also derived classes.

```ts
class Foo {
    protected field0: number;
}
```

```yaml
name: TS field protected modifier
entity:
    type: field
    extra: false
    items:
        -   name: field0
            qualified: Foo.field0
            loc: 2:15
            TSModifier: protected
```

###### The `private` modifier

Fields modified by `private` can only be accessed from the base
class.

```ts
class Foo {
    private field0: number;
}
```

```yaml
name: TS field private modifier
entity:
    type: field
    extra: false
    items:
        -   name: field0
            qualified: Foo.field0
            loc: 2:13
            TSModifier: private
```

###### Cannot be used with private identifier

```ts
class Foo {
    protected #a;
    // TSError: An accessibility modifier cannot be used with a private identifier.
}
```

```yaml
name: TS modifier cannot be used with private identifier
entity:
    type: field
    extra: false
    items:
        -   name: <Modified raw="a" as="PrivateIdentifier">
            qualified: Foo.#a
            loc: 2:15
            TSModifier: protected
            negative: true
```

#### Syntax: TypeScript implicit field declarations

```text
ConstructorDeclaration:
    [AccessibilityModifier] `constructor` `(` ParameterList `)` `{` FunctionBody `}`
    [AccessibilityModifier] `constructor` `(` ParameterList `)` `;`
```

`BindingPattern` of parameters cannot be used with
parameters' `AccessibilityModifier`.

##### Examples

###### Implicit field declarations with accessibility modifier

```ts
class Rectangle {
    /**
     * In TypeScript, fields must be explicitly declared
     * before referenced using `this.*`.
     * If this is forced to be ignored, then it will fallback to
     * JS implicit field declaration that works in runtime.
     */
    area: number;

    constructor(private height: number, private width: number) {
        /**
         * Below two expressions are not necessary.
         * TypeScript will automatically insert these at compile time.
         */
        // this.height = height;
        // this.width = width;
        this.area = height * width;
    }
}
```

```yaml
name: TS implicit field declaration with accessibility modifier
entity:
    type: field
    extra: false
    items:
        -   name: height
            qualified: Rectangle.height
            loc: 8:25
            TSModifier: private
        -   name: width
            qualified: Rectangle.width
            loc: 8:49
            TSModifier: private
        -   name: area
            qualified: Rectangle.area
            loc: 6:5
            TSModifier: public
```

###### Binding pattern cannot be used with accessibility modifier

```ts
//// @no-test
class Rectangle {
    height: number;
    width: number;

    // Valid
    constructor({height, width}) {
        this.height = height;
        this.width = width;
    }

    // Invalid
    // constructor(public {height, width}) { ... }
    // TSError: A parameter property may not be declared using a binding pattern.
}
```

###### Clarify: Parameter fields vs parameters

```ts
class Foo {
    constructor(public a, b, c) {
        /**
         * `a` is modified by `public`, thus becomes a field,
         * which makes following commented expresssion unnecessary.
         */
        // this.a = a;

        /**
         * JS style implicit field declaration.
         */
        // @ts-ignore
        this.b = b;

        /**
         * `c` can only be referenced as parameter.
         */
        console.log(c);
    }
}
```

```yaml
name: Parameter fields and parameters clarify
entity:
    type: field
    extra: false
    items:
        -   name: a
            qualified: Foo.a
            loc: 2:24
            TSModifier: public
        -   name: a
            qualified: Foo.constructor.a
            loc: 2:24
            type: parameter
        -   name: b
            qualified: Foo.b
            loc: 13:14
            implicit: true
        -   name: b
            qualified: Foo.constructor.b
            loc: 2:27
            type: parameter
        -   name: c
            qualified: Foo.constructor.c
            loc: 2:30
            type: parameter
```

#### Syntax: TypeScript abstract field

```text
(No official doc found)
TSAbstract Property :
    `abstract` PropertyName [PropertySignature]
```

Abstract fields cannot be initialized within any abstract
classes.

> Fields with `MethodSignature` are extracted as `Method Entity`,
> continue
> reading [abstract methods](./method.md#abstract-methods)
> section to learn more.

##### Examples

###### Abstract fields

```ts
abstract class Foo {
    abstract field0: number;
    public abstract field1: number;
    protected abstract field2: number;

    // Invalid
    // TSError: 'private' modifier cannot be used with 'abstract' modifier.
    private abstract field3: number;
    // TSError: 'abstract' modifier cannot be used with a private identifier.
    abstract #field4: number;
    // TSError: 'static' modifier cannot be used with 'abstract' modifier.
    static abstract field5: number;
}
```

```yaml
name: Abstract fields
entity:
    type: field
    extra: false
    items:
        -   name: field0
            qualified: Foo.field0
            loc: 2:14
            abstract: true
            TSModifier: public
        -   name: field1
            qualified: Foo.field1
            loc: 3:21
            abstract: true
            TSModifier: public
        -   name: field2
            qualified: Foo.field2
            loc: 4:24
            abstract: true
            TSModifier: protected
        -   name: field3
            qualified: Foo.field3
            loc: 8:22
            abstract: true
            TSModifier: private
            negative: true
        -   name: <Modified raw="field4" as="PrivateIdentifier">
            qualified: Foo.#field4
            loc: 10:14
            abstract: true
            negative: true
        -   name: field5
            qualified: Foo.field5
            loc: 12:21
            abstract: true
            static: true
            negative: true
```

###### `abstract` fields must be declared within an abstract class

```ts
class Foo {
    // TSError: Abstract methods can only appear within an abstract class.
    abstract foo: number;
}
```

```yaml
name: Abstract fields in a non-abstract class
entity:
    extra: false
    items:
        -   name: Foo
            type: class
            loc: 1:7
            abstract: false
        -   name: foo
            qualified: Foo.foo
            type: field
            loc: 3:14
            abstract: true
            negative: true
```
