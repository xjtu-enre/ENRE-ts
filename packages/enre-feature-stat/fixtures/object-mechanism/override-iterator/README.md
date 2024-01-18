# Override Iterator

## Patterns

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
```

## Metrics

* #Usage%
