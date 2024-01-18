# Calling API over Creating Literal

## Patterns

Object creation:

```js
// Literal usage
//          vv
const foo = {};

// Constructor usage
//          vvvvvvvvvv
const bar = new Object();

// API usage
//          vvvvvvvvvvvvv
const baz = Object.create(null);
```

Function creation:

```js
const foo = () => {
    /* Empty */
}

const bar = new Function();
```

String creation:

```js
const foo = 'a';

const bar = new String('a');
```

Number creation:

```js
const foo = 1;

const bar = new Number(1);
```

## Metrics

* #Usage%
