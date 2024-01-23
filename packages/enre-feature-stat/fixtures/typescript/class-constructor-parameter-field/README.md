# Class Constructor Parameter Field and Parameter

## Patterns

> Ref:
> [Test Case](../../../../../docs/entity/field.md#clarify-parameter-fields-vs-parameters)

```ts
class Foo {
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
```

## Metrics

* #Usage%
* Parameter Index
