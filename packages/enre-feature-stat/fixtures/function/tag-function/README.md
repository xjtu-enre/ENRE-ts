# Tag Function

A tag can be applied before template literal.

## Patterns

```js
// `myTag` is a function that returns a new string
//vvv
myTag`That ${person} is a ${age}.`;
```

Fancy usages:

```js
console.log`Hello`; // [ 'Hello' ]
console.log.bind(1, 2)`Hello`; // 2 [ 'Hello' ]
new Function("console.log(arguments)")`Hello`; // [Arguments] { '0': [ 'Hello' ] }

function recursive(strings, ...values) {
    console.log(strings, values);
    return recursive;
}

recursive`Hello``World`;
// [ 'Hello' ] []
// [ 'World' ] []
```

## Metrics

* #Usage%
* #FancyUsage%
