# `Symbol`s

## Patterns (19)

All built-in symbols:

> Ref: [Test Case](../../../../../docs/implicit/symbols.md)

```js
Symbol.asyncIterator;
Symbol.hasInstance;
Symbol.isConcatSpreadable;
Symbol.iterator;
Symbol.match;
Symbol.matchAll;
Symbol.replace;
Symbol.search;
Symbol.species;
Symbol.split;
Symbol.toPrimitive;
Symbol.toStringTag;
Symbol.unscopables;

// Proposal: https://github.com/tc39/proposal-explicit-resource-management
Symbol.dispose;                 // using
Symbol.asyncDispose;            // await using
```

Override iterator:

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

<!--* Types{OriginalType} (The original entity type whose iterator is overridden)-->

## Tags

* dynamic
* implicit
