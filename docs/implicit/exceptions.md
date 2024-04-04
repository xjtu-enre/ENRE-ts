## Exceptions

Throw exceptions.

### Supported Patterns

```yaml 
name: Implicit Exception Calls
```

#### Semantic: Exception

##### Examples

###### Throw

<!--pycg:exceptions/raise-->

```js
class AError extends Error {
    constructor() {
        super();
    }
}


throw new AError();
```

```yaml
relation:
    type: call
    extra: false
    items:
        -   from: file:'<File file0.js>'
            to: method:'constructor'
            loc: 8:11:6
```

###### Exception Class Assigned

<!--pycg:exceptions/raise_assigned-->

```js
class AError extends Error {
    constructor() {
        super();
    }
}

const a = AError;

throw new a();
```

```yaml
relation:
    type: call
    extra: false
    items:
        -   from: file:'<File file0.js>'
            to: method:'constructor'
            loc: 9:11:1
            by: variable:'a'
```

###### Throw Method

<!--pycg:exceptions/raise_attr-->

```js
class BError extends Error {
    constructor() {
        super();
    }
}

class A {
    static B = BError;
}

throw new A.B();
```

```yaml
relation:
    type: call
    extra: false
    items:
        -   from: file:'<File file0.js>'
            to: method:'BError.constructor'
            loc: 11:13:1
```

<!-- This is a highly dynamic feature, so we can't really do much with it.

#### Semantic: Generator.return()

```text
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator/return
```

##### Examples

###### Using with a try-finally block

```js
function func1() {
    console.log('func1')
};

function func2() {
    console.log('func2')
};

function func3() {
    console.log('func3')
};

function* gen() {
    yield func1;
    try {
        yield func2;
        yield func3;
    } finally {
        yield func4;
    }
}

const g = gen();

g.next().value();       // func1 called, output `func1`
g.next().value();       // func2
g.return().value();     // func4 (The control flow must be inside the try block)
```
