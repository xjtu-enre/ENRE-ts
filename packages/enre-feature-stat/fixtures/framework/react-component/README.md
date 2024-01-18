# React Component

## Patterns

Class component:

```js
import React from 'react';
import {Component} from 'react';

class Foo extends React.Component {
    /* Empty */
}

class Bar extends Component {
    /* Empty */
}
```

Function component:

```jsx
import {useState} from 'react';

function Foo(props) {
    const [state, setState] = useState('');

    return <h1>foo</h1>;
}
```

## Metrics

* #Usage% (For each type)
