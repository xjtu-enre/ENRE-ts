# Class Constructor Parameter Field and Parameter

## Patterns

> Ref:
> [Test Case](../../../../../docs/entity/field.md#clarify-parameter-fields-vs-parameters)

```ts
// Pure parameter
class Foo {
    constructor(a) {
        this.a = a;
    }
}

// Mixed field and parameter
class Bar {
    // TypeScript parameter field
    //          vvvvvvvv
    constructor(public a, b, c) {
        //                ^  ^
        // Normal parameter

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

// Pure field
class Baz {
    constructor(public a, private b, protected c) {
        // All parameters are modified by `public`, thus becomes fields.
    }
}
```

## Metrics

* #Usage(Mixed Field and Param Usage)%(Class Constructor)
* Types{PureParameter, MixedFieldAndParam, PureField}
    * PureParameter: `constructor(a, b, c)`
    * MixedFieldAndParam: `constructor(public a, b, c)`
    * PureField: `constructor(public a, public b, public c)`

## Tags

* static
