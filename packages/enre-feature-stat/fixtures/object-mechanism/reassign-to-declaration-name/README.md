# Reassign to Declaration Name

## Patterns (2)

```js
function foo() {
    /* Empty */
}

// Name `foo` declared by statement is assigned to a new value
//vvv
foo = function () {
    /* Empty */
};
```

```js
class Foo {
    /* Empty */
}

//vvv
Foo = class {
    /* Empty */
};
```

Although TypeScript entities can also be reassigned, an error will be explicitly thrown by
tsc, so this is not a concern.

## Metrics

* #Usage%(Function/Class Declaration)

## Tags

* dynamic
* implicit
