# Use `arguments` in Function Body

[In modern code, rest parameters should be preferred.](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments#description)

Use `arguments` with declared parameters will face the potential risk of syncing argument
values between the
two, [under certain circumstances](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments#assigning_to_indices),
un update to one will not be reflected to the
other. <!--TODO: Write script to explicitly detect this pattern-->

## Patterns

```js
//          Usually the function declares no parameter
//          vv
function foo() {
    // Access runtime arguments by this special variable
    //vvvvvvv
    arguments[0];
}

//                   But it is possible to use both
//                   vvvvvv
const bar = function (a, b) {
    arguments[0];
}

//                       In mordern code, rest parameter should be used
//                       v
const baz = function (...r) {
    r[0];
    arguments[0];
}

class Clz {
    // Can be also used in class methods
    mthd() {
        arguments[0];
    }
}

// But not within arrow functions

// Identifier `arguments` should not be a property access's right part
function A(a) {
    a.arguments;
}

// `arguments` outside a function should also not be extracted
b.arguments;
```

## Metrics

* #Usage%(Function)
* Type{WithNormalParamDecl, WithRestParamDecl, WithoutParamDecl}
    * WithParamDecl`@intent?`: The function declares parameters.
    * WithRestParamDecl`@intent?`: The function declares the rest parameter.
    * WithoutParamDecl: The function does not declare parameters.

## Tags

* implicit
* dynamic
