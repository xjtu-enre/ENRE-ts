## Throw

Rise exceptions.

### Supported Patterns

```yaml
name: Advanced Exceptions
```

#### Semantic: Exception

##### Examples

###### Throw
In Python, exceptions are typically raised using the `raise` statement, while in JavaScript or TypeScript, it is accomplished using the `throw` statement. Although the terminology is different, they actually represent the same concept: raising exceptions.
```ts
class AError extends Error {
    constructor() {
        super("AError");
    }
}

try {
    throw new AError();
} catch (error) {
    if (error instanceof AError) {
        console.error("Caught AError");
    } else {
        throw error;
    }
}
   
```
```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: file:'<File file0.ts>'
            to: method:'AError.constructor'
            loc: 8:15:6
```
###### Exception Class Assigned
Define a custom exception class AError, inheriting from the built-in Error class. Then, we create a variable 'a' and assign it the AError class.
```ts
class AError extends Error {
    constructor() {
        super("AError");
    }
}

const a = AError;

try {
    throw new a();
} catch (error) {
    if (error instanceof AError) {
        console.error("Caught AError");
    } else {
        throw error;
    }
}

```
```yaml
relation:
    items:
        -   from: file:'<File file1.ts>'
            to: variable: 'a'
            loc: 7:7:1
            type: set
            init: true
        -   from: file:'<File file1.ts>'
            to: method:'AError.constructor'
            loc: 10:15:1
            type: call
            implicit: true
```
###### Throw Attr
 A custom error class BError is defined, inheriting from the built-in Error class. In the class A, a static property B is defined using 'static B = BError', which references the BError class.
```ts
class BError extends Error {
    constructor() {
        super("BError");
    }
}

class A {
    static B = BError;
}

try {
    throw new A.B();
} catch (error) {
    if (error instanceof A.B) {
        console.error("Caught BError");
    } else {
        throw error;
    }
}

```
```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: file:'<File file2.ts>'
            to: method:'A.Error.constructor'
            loc: 12:15:3
```
