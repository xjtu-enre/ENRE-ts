# `createElement` over JSX

JSX makes create React component easier, if possible, there should be no reason to
call `createElement` function directly.

## Patterns

JSX:

```jsx
const element = <h1>Hello, world!</h1>;
```

createElement:

```js
import React, {createElement} from 'react';

const element = React.createElement('h1', null, 'Hello, world!');

createElement('h1', null, 'Hello, world!');
```

## Metrics

* #Usage
* Type{CreateElementInJS, CreateElementInJSX}
    * CreateElementInJS: Call `React.createElement` in a JavaScript file.
    * CreateElementInJSX`@intent?`: Call `React.createElement` in a JSX file.

## Tags

* semantic
