## Entity: Field

A `Field Entity` is a public / private *variable* defined inside
a `Class Entity`.

> This entity is named as `field` rather than `property`, which
> is typically used in other languages.
> See [this discussion](https://stackoverflow.com/a/54851218)
> for our consideration.

### Supported Pattern

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
            qualified: Foo.✅
            loc: 11:5:3
        -   name: <Modified raw="3" as="NumericLiteral" value="3">
            qualified: Foo.3
            loc: 17:5:1
        -   name: <Modified raw="1_000_000" as="NumericLiteral" value="1000000">
            qualified: Foo.1_000_000
            loc: 18:5:9
        -   name: <Modified raw="1e-3" as="NumericLiteral" value="0.001">
            qualified: Foo.1e-3
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

#### Runtime: Implicitly declare with `this.*`

##### Examples

###### TODO

```js
//// @no-test
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
//// @no-test
class Foo {
    protected #a;
    // TSError: An accessibility modifier cannot be used with a private identifier.
}
```
