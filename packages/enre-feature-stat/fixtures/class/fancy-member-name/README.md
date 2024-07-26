# Fancy Class Member Name

Fancy name can be applied to class field, class method, class getter, and class setter.

## Patterns (15)

> Ref: [Test Case](../../../../../docs/entity/field.md#public-fields)

```js
class Foo {
    // Not fancy names
    constructor() {
        /* Empty */
    }

    a;
    #b;

    foo() {
        /* Empty */
    }

    #bar() {
        /* Empty */
    }

    get #baz() {
        return 1;
    }

    set #baz(v) {
        this.v = v;
    }

    // Below are fancy names
    'c';
    '✅';

    3;
    1_000_000;
    1e-3;

    [`!computed${d}`];

    '✅'() {
        /* Empty */
    }

    1_000_000() {
        /* Empty */
    }

    [`!computed${c}`]() {
        /* Empty */
    }

    get 'e'() {
        return 0;
    }

    get 1_000() {
        return 1;
    }

    get [`!computed${e}`]() {
        return 2;
    }

    set 'f'(v) {
        this.v = v;
    }

    set 1_000(v) {
        this.v = v;
    }

    set [`!computed${f}`](v) {
        this.v = v;
    }
}
```

## Metrics

* #Usage%(Class, Class Member)
* Type{Identifier, StringLiteralIdentifier, FancyStringLiteral, RawNumericLiteral,
  ConvertedNumericLiteral, ComputedValue}
    * Identifier: Normal valid identifier. **(Not included in class usage)**
    * StringLiteralIdentifier`@intent?`: Valid identifier but in string literal.
    * FancyStringLiteral`@intent?`: Invalid identifier in string literal.
    * RawNumericLiteral`@intent?`: Numeric literal whose raw string is the same as its
      value string (base10-ed).
    * ConvertedNumericLiteral`@intent?`: Numeric literal that is not categorized
      into `RawNumericLiteral`.
    * ComputedValue: Use `[]` to do any expression computation (regardless of whether the
      expression is static determinable)

## Tags

* static
* dynamic
