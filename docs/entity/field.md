## Entity: Field

A `Field Entity` is a public / private *variable* defined inside
a `Class Entity`.

> <a name="und_property" />This entity is named as `field` rather
> than `property`, which is traditionally used in other
> languages.
> See [this discussion](https://stackoverflow.com/a/54851218)
> for a detailed understanding.

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

###### Public fields<a name="und_class_field" />

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
            loc: [ 2, 5 ]
        -   name: b
            loc: [ 3, 5 ]
        -   name: <Modified raw="c" as="StringLiteral">
            loc: [ 10, 5, 3 ]
        -   name: <Modified raw="✅" as="StringLiteral">
            loc: [ 11, 5, 3 ]
        -   name: <Modified raw="3" as="NumericLiteral" value="3">
            loc: [ 17, 5, 1 ]
        -   name: <Modified raw="1_000_000" as="NumericLiteral" value="1000000">
            loc: [ 18, 5, 9 ]
        -   name: <Modified raw="1e-3" as="NumericLiteral" value="0.001">
            loc: [ 19, 5, 4 ]
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
            loc: [ 2, 5, 4 ]
            private: true
        -   name: <Modified raw="baz" as="PrivateIdentifier">
            loc: [ 3, 5, 4 ]
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
            loc: [ 2, 12 ]
            static: true
        -   name: <Modified raw="bar" as="PrivateIdentifier">
            loc: [ 3, 12, 4 ]
            static: true
            private: true
```

#### Runtime: Implicitly declare with `this.*`

TODO
