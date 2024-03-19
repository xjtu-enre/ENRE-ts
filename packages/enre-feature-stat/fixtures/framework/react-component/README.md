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
        return <h1>Foo</h1>;
    }
}

class Bar extends Component {
    render() {
        return <h1>Bar</h1>;
    }
}
```

Function component (Modern React recommendation
after [2018](https://react.dev/blog/2023/03/16/introducing-react-dev#going-all-in-on-modern-react-with-hooks)):

```jsx
import {useState, useEffect} from 'react';

// Function component's name must be capitalized
//       vvv
function Foo(props) {
    const [state, setState] = useState('');
    useEffect(() => {
        // ...
    }, []);

    return <h1>Foo</h1>;
}

// Arrow function can also be React function component
const Bar = (props) => <h1>Bar</h1>;
const Baz = (props) => (<h1>Baz</h1>);
const App = (props) => {
    return (
        <div>a</div>
    );
};
const Conditional = (props) => {
    if (props.a) {
        return <div>a</div>;
    } else {
        return <div>b</div>;
    }
};

// Not React function component
function N1() {
    return 1;
}

const N2 = () => 1;
```

Cornel case:

```jsx
import React, {Component} from 'react';

class Foo extends React.Component {
    render() {
        return <h1>Foo</h1>;
    }
}

class Bar extends Component {
    render() {
        return <h1>Bar</h1>;
    }
}
```

```jsx
import {useState as us, useEffect as ue} from 'react';

const Conditional = (props) => {
    const [state, setState] = us('');
    ue(() => {
        // ...
    }, []);

    if (props.a) {
        return <div>a</div>;
    } else {
        return <div>b</div>;
    }
};
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
* implicit
