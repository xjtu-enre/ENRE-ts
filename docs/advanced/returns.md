## Return

Returning a function as the return value or returning a function as the result.

### Supported Patterns

```yaml
name: Advanced return
```

#### Semantic: Return

##### Examples

###### Call 

<!-- returns/call -->

```js
function ReturnFunc() {
  /* Empty */
}

function func() {
  return ReturnFunc;
}

const a = func();
a();

```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: file:'<File file0.js>'
            to: function:'func'
            loc: 10:1:1
        -   from: function:'func'
            to: function:'ReturnFunc'
            loc: 6:10:11
```

###### Imported Call

<!-- returns/imported_call -->

```js
function ReturnFunc() {
    /* Empty */
}

function func() {
    return ReturnFunc;
}

module.exports = { func };
```

```js
const { func } = require('./file1');

const a = func();
a();
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: file:'<File file1.js>'
            to: function:'file0.func'
            loc: file0:4:1
        -   from: file:'<File file1.js>'
            to: function:'file0.ReturnFunc'
            loc: file1:4:1
```

###### Nested Imported Call 

<!-- returns/nested_imported_call -->

```js
const { ReturnFunc } = require('./file1');

function func() {
    return ReturnFunc();
}

module.exports = { func };
```

```js
function ReturnFunc() {
    /* Empty */
}

module.exports = { ReturnFunc };
```

```js
const { func } = require('./file0');

const a = func();
a();
```

```yaml
relation:
    type: call
    items:
        -   from: file:'<File file2.js>'
            to: function:'file0.func'
            loc: file2:4:1
        -   from: file:'<File file2.js>'
            to: function:'file1.ReturnFunc'
            loc: file2:4:1
            implicit: true
```

###### Return Complex

<!-- returns/return_complex -->

```js
function func() {
    return 1 + 1;
}

func();

function func2() {
    return 1;
}

function func3() {
    return func2;
}

function func4(a) {
    return func3();
}

func4()();

function func5() {
    return func2() + 1;
}

func5();
```

```yaml

relation:
    type: call
    implicit: true
    items:
        -   from: file:'<File file0.js>'
            to: function:'func'
            loc: 5:1:4
        -   from: function:'func4'
            to: function:'func3'
            loc: 20:1:5
        -   from: function:'func5'
            to: function:'func2'
            loc: 26:1:5
```
            