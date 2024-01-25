# React Component

## Patterns

Class component:

```jsx
import React from 'react';
import {Component} from 'react';

class Foo extends React.Component {
    // Lifecycle methods
    constructor() {
        super();
        // ...
    }

    componentDidMount() {
        // ...
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        // ...
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // ...
    }

    componentWillUnmount() {
        // ...
    }

    componentDidCatch(error, errorInfo) {
        // ...
    }

    // End of lifecycle methods

    render() {
        return <h1>Foo</h1>
    }
}

class Bar extends Component {
    render() {
        return <h1>Bar</h1>
    }
}
```

Function component:

```jsx
import {useState, useEffect} from 'react';

function Foo(props) {
    const [state, setState] = useState('');
    useEffect(() => {
        // ...
    }, []);

    return <h1>Foo</h1>;
}
```

## Metrics

* #Usage%(React Component)
* Type{ClassComponent, FunctionComponent}
    * ClassComponent: A class, extending React.Component, override
      life circle methods, and usually mix different logic into the same lifecycle
      methods.
    * FunctionComponent: A function using react hooks, hooks can be invoked multiple
      times, by this means to separate different logic.
* MaxCount(High level intends in one lifecycle method if it is a class
  component)`@LLMPowered`
* MaxCount(`useState` hook calls if it is a function component)
* MaxCount(`useEffect` hook calls if it is a function component)

<!--TODO: React ecosystem also encapsulates more hooks, which usually starts with `use`-->

## Tags

* semantic
