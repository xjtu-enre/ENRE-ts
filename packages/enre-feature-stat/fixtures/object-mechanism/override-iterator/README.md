# Override Iterator

## Patterns

> Ref: [Test Case](../../../../../docs/implicit/symbols.md)

```js
const obj = {
    // Using predefined symbol to override iterator
    //vvvvvvvvvvvvvvv
    [Symbol.iterator]: function* () {
        yield 1;
        yield 2;
    },
};

// Or
// vvvvvvvvvvvvvvvvv
obj[Symbol.iterator] = function* () {
    yield 3;
    yield 4;
};

// Usages
for (const v of obj) {
    v;
}

const [...bar] = obj;
```

```js
// Also works if originally is an array
//          vv
const arr = [];

// This generator will be called by ..., for loop, but NOT [0]
// vvvvvvvvvvvvvvvvv
arr[Symbol.iterator] = function* () {
    yield 5;
    yield 6;
};

// This generator will be called by await for
// vvvvvvvvvvvvvvvvvvvvvv
arr[Symbol.asyncIterator] = function* () {
    yield 7;
    yield 8;
};

// Usages
for (const v of arr) {
    v;
}

const [...bar] = arr;

for await (const v of arr) {
    v;
}
```

## Metrics

* #Usage

## Tags

* dynamic
* implicit
