# Modify First Class Citizen's Prop

## Patterns

```js
function foo() {
    /* Empty */
}

// A function is used as part of MemberExpression
//vvvvvvv
foo.bar = 1;
foo.baz = {};
foo.baz.a = [1, 2];
```

```js
class Foo {
    /* Empty */
}

// Class can also be used in the same way
//vvvvvvv
Foo.bar = function () {
    /* Empty */
};
Foo.baz = {};
Foo.baz.a = class {
    /* Empty */
};
```

## Metrics

* #Usage%(Function/Class Declaration)

## Tags

* dynamic
