# Calling API over Creating Literal

https://stackoverflow.com/questions/17256182/what-is-the-difference-between-string-primitives-and-string-objects-in-javascrip

## Patterns

Object creation:

```js
// Literal usage
//          vv
const foo = {};

const bar = Object();

// Constructor usage
//          vvvvvvvvvv
const baz = new Object();

// API usage
//          vvvvvvvvvvvvv
const bazz = Object.create(null);
```

Function creation:

```js
const foo = () => {
    /* Empty */
}

const bar = Function();

const bar = new Function();
```

String creation:

```js
const foo = 'a';

const bar = String('a');

const baz = new String('a');
```

Number creation:

```js
const foo = 1;

const bar = Number(1);

const baz = new Number(1);
```

## Metrics

* #Usage%(Heap Object Creation Point)
* Types

## Tags

* dynamic
