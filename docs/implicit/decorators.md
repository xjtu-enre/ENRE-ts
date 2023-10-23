## Decorators

Decorator usages, JavaScript functions can not be decorated.

### Supported Patterns

```yaml
name: Implicit Decorators
```

<!--pycg:decorators/nested not-supported-->

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
  type: call
  items:
    - from: class:'Clz'
      to: function:'dec1'
      loc: 14:6
    - from: class:'Clz'
      to: function:'dec2'
      loc: 15:6
    - from: class:'Clz'
      to: function:'dec2'
      loc: 16:6:1
      implicit: true
    - from: function:'dec1'
      to: method:'method'
      loc: 2:5:1
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
  items:
    - from: file:'<File file0.js>'
      to: function:'func1'
      loc: 10:6
    - from: function:'dec'
      to: method:'method'
      loc: 10:6:7
      type: decorate
      implicit: true
    - from: class:'Clz'
      to: function:'dec'
      loc: 10:6:7
      implicit: true
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
  implicit: true
  items:
    - from: file:'<File file0.ts>'
      to: function:'dec1.inner'
      loc: 24:11:6
    - from: function:'dec1.inner'
      to: function:'dec2.inner'
      loc: 3:16:1
    - from: function:'dec2.inner'
      to: function:'func'
      loc: 11:16:1
```
