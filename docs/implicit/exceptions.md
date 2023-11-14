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
    implicit: true
    items:
        -   from: file:'<File file0.js>'
            to: method:'constructor'
            loc: 9:11:1
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
    implicit: true
    items:
        -   from: file:'<File file0.ts>'
            to: method:'A.Error.constructor'
            loc: 12:15:3
```
