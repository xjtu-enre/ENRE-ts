## Decorators

Decorator usages, JavaScript functions can not be decorated.

### Supported Patterns

```yaml
name: Implicit Decorators
```

<!--pycg:decorators/nested unsupported-->

#### Semantic: Decorators

##### Examples

###### Basic

<!--pycg:decorators/call-->
<!--pycg:decorators/param_call-->
<!--pycg:decorators/assigned-->

```js
function dec1(f, c) {                   // It is not an error for not providing two parameters
    f();
    return f;
}

function dec2(f, c) {
    return f;
}

let a = dec1;
a = dec2;

class Clz {
    @dec1
    @dec2
    @a method() {                       // Note the decorator execution order: a -> dec2 -> dec1 (-> method)
        /* Empty */
    }
}
```

```yaml
relation:
    type: decorate
    extra: false
    items:
        -   from: function:'dec1'
            to: method:'method'
            loc: 14:6
        -   from: function:'dec2'
            to: method:'method'
            loc: 15:6
        -   from: function:'dec2'
            to: method:'method'
            loc: 16:6:1
            by: variable:'a'
        -   from: function:'dec1'
            type: call
            to: method:'method'
            loc: 2:5:1
            by: parameter:'f'
```

###### Expression in decorator

<!--pycg:decorators/return-->

```js
function func1() {
    function dec(f) {
        return f;
    }

    return dec;
}

class Clz {
    @func1() method() {
        /* Empty */
    }
}
```

```yaml
relation:
    type: call
    extra: false
    items:
        -   from: class:'Clz'
            to: function:'func1'
            loc: 10:6
        -   from: function:'dec'
            type: decorate
            to: method:'method'
            loc: 10:6:7
            by: ~
```

###### Nested decorators and returns

<!--pycg:decorators/nested_decorators-->
<!--pycg:decorators/return_different_func-->

```js
function dec1(f) {
    function inner() {
        return f();
    }

    return inner;
}

function dec2(f) {
    function inner() {
        return f();
    }

    return inner;
}

class Clz {
    @dec1
    @dec2 method() {
        /* Empty */
    }
}

new Clz().method();
```

```yaml
relation:
    type: call
    extra: false
    items:
        -   from: file:'<File file0.js>'
            to: class:'Clz'
            loc: 24:5
        -   from: file:'<File file0.ts>'
            to: function:'dec1.inner'
            loc: 24:11:6
            by: ~
        -   from: function:'dec1.inner'
            to: function:'dec2.inner'
            loc: 3:16:1
            by: ~
        -   from: function:'dec2.inner'
            to: method:'method'
            loc: 11:16:1
```
