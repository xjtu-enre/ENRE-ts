## High-Order Function

Function returns a function.

### Supported Patterns

```yaml
name: Implicit High-Order Function
```

<!--pycg:direct_calls/imported_return_call unnecessary-->

#### Semantic: High-Order Function

##### Examples

###### Assigned Call

<!--pycg:direct_calls/assigned_call-->

```js
function returnFunc() {
    /* Empty */
}

function func() {
    const a = returnFunc;
    return a;
}

const a = func;
a()(); 
```

```yaml
relation:
  type: call
  implicit: true
  items:
    - from: file:'<File file0.js>'
      to: function:'func'
      loc: 11:1:1
    - from: file:'<File file0.js>'
      to: function:'returnFunc'
      loc: 11:1:3
```

###### Return call

<!--pycg:direct_calls/return_call-->

```js
function returnFunc() {
    function nestedReturnFunc() {
        /* Empty */
    }

    return nestedReturnFunc;
}

function func() {
    return returnFunc;
}

func()()();
```

```yaml
relation:
  type: call
  implicit: true
  items:
    - from: file:'<File file0.js>'
      to: function:'func'
      loc: 13:1
      implicit: false
    - from: file:'<File file0.js>'
      to: function:'returnFunc'
      loc: 13:1:6
    - from: file:'<File file0.js>'
      to: function:'nestedReturnFunc'
      loc: 13:1:8
```

###### With parameters

<!--pycg:direct_calls/with_parameters-->

```js
function func() {
    /* Empty */
}

function func2(a) {
    return a;
}

function func3() {
    return func2;
}

func3()(func)(); 
```

```yaml
relation:
  type: call
  implicit: true
  items:
    - from: file:'<File file0.js>'
      to: function:'func3'
      loc: 13:1
      implicit: false
    - from: file:'<File file0.js>'
      to: function:'func2'
      loc: 13:1:7
    - from: file:'<File file0.js>'
      to: function:'func'
      loc: 13:1:13
```
