## Return

Returning a function as the return value" 或 "returning a function as the result.

### Supported Patterns

```yaml
name: Advanced return
```

#### Semantic: Return

##### Examples

###### Call 
```js
function return_func() {
  /*Empty*/
}

function func() {
  return return_func;
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
            to: function:'return_func'
            loc: 6:10:11
```
###### Imported Call 
```js
function return_func() {
    /*Empty*/
}

function func() {
    return return_func;
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
        -   from: file:'<File file2.js>'
            to: function:'file1.func'
            loc: file2:4:1
        -   from: file:'<File file2.js>'
            to: function:'file1.return_func'
            loc: file2:4:1
```
###### Nested Imported Call 
```js
const { return_func } = require('./file4');

function func() {
    return return_func();
}

module.exports = { func };

```
```js
function return_func() {
    /*Empty*/
}

module.exports = { return_func };

```
```js
const { func } = require('./file3');

const a = func();
a();

```
```yaml
relation:
    type: call
    items:
        -   from: file:'<File file5.js>'
            to: function:'file3.func'
            loc: file5:4:1
        -   from: file:'<File file5.js>'
            to: function:'file4.return_func'
            loc: file5:4:1
            implicit: true
```
###### Return Complex
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

```relation:
    type: call
    implicit: true
    items:
        -   from: file:'<File file6.js>'
            to: function:'func'
            loc: 5:1:4
        -   from: function:'func4'
            to: function:'func3'
            loc: 20:1:5
        -   from: function:'func5'
            to: function:'func2'
            loc: 26:1:5
            