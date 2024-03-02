# Parameter Destructuring

## Patterns

```js
//           A normal parameter decralation
//           v
function foo(a, {b}, [c], ...d) {
    //          ^^^  ^^^     ^
    //          Destructuring patterns
    /* Empty */
}

const bar = (a, {b}, [c], ...d) => {
    /* Empty */
};

const C = class {
    constructor(a, {b}, [c], ...d) {
        /* Empty */
    }

    foo(a, {b}, [c], ...d) {
        /* Empty */
    }
};

function singleObjPattern({a}) {
    /* Empty */
}

function singleArrPattern([a]) {
    /* Empty */
}

function singleRestPattern(...a) {
    /* Empty */
}

function destedRestPattern(a, ...[b, {c}]) {
    /* Empty */
}

function normal(a) {
    /* Empty */
}
```

## Metrics

* #Usage(Function With Destructuring Parameter)%(Function)
* #Usage(Function With Destructured Rest Parameter)%(Function)
* MaxCount(Rest Parameter Destructuring Pattern Nesting Depth)
* MexCount(Non-Rest-Parameter Destructuring Pattern Nesting Depth) (Unlike variable, this
  metric considers both normal pattern depth and rest pattern depth.)

## Tags

* static
