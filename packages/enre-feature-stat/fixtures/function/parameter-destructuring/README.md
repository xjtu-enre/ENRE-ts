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

function normal(a) {
    /* Empty */
}
```

## Metrics

* #Usage%(Function)

## Tags

* static
