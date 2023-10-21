## Array

JavaScript arrays can store multiple values and access these values by index.

### Supported Patterns

```yaml
name: Advanced Arrays
```

#### Semantic: Array
 
##### Examples

###### Filter

<!-- lists/comprehension_if -->

```js
function func(): boolean {
    return true;
}

const a: number[] = [...Array(10).keys()].filter(() => func());
```

```yaml
relation:
    type: call
    implicit: false
    items:
        -   from: file:'<File file0.js>'
            to: function:'func'
            loc: 4:56:4
```

###### Array Comprehension 

<!-- lists/comprehension_if -->

```js
function func(a) {
    return a + 1;
}

let ls = [];
for (let a = 0; a < 10; a++) {
    ls.push(func(a));
}
```

```yaml
relation:
    type: call
    implicit: false
    items:
        -   from: file:'<File file0.js>'
            to: function:'func'
            loc: 7:13:4
```

###### Ext Index

<!-- lists/ext_index -->

```js
const key = 1;
export {key};
```

```js
import { key } from './file0.js';

function func1() {
    /* Empty */
}

function func2() {
    /* Empty */
}

const ls = [func1, func2];

ls[key]();
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: file:'<File file1.js>'
            to: function:'func2'
            loc: fille1:1:2
```

###### Nested

<!-- lists/nested -->

```js
function func1() {
    /* Empty */
}

function func2() {
    /* Empty */
}

const ls = [[func1], func2];

ls[0][0]();
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: file:'<File file0.js>'
            to: function:'func1'
            loc: 11:1:8
```

###### Map

<!-- lists/nested_comprehension -->

```js
function func1(a) {
    return a + 1;
}

function func2(a) {
    return a + 1;
}

const result = [...Array(10).keys()].map(b => func1(func2(b)));
```

```yaml
relation:
    type: call
    items:
        -   from: file:'<File file0.js>'
            to: function:'func1'
            loc: 9:47:4
        -   from: function:'func1'
            to: function:'func2'
            loc: 9:53:4
            implicit: true
```

###### Arguments

<!-- lists/nested_comprehension -->

```js
function func2() {
    /* Empty */
}

function func1(key) {
    ls[key]();
}

const ls = [func1, func2];

func1(1);
```

```yaml
relation:
    type: call
    items:
        -   from: file:'<File file0.js>'
            to: function:'func1'
            loc: 11:1:4
        -   from: function:'func1'
            to: function:'func2'
            loc: 6:5:2
            implicit: true
```

###### Simple

<!-- lists/simple -->

```js
function func1() {
    /* Empty */
}

function func2() {
    /* Empty */
}

function func3() {
    /* Empty */
}

const a = [func1, func2, func3];

a[0]();
a[1]();
a[2]();

function func4() {
    /* Empty */
}

const b = [null];
b[0] = func4;

b[0]();
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: file:'<File file0.js>'
            to: function:'func4'
            loc: 26:1:4
```

###### Slice

<!-- lists/slice -->

```js
function func1() {
    /* Empty */
}

function func2() {
    /* Empty */
}

function func3() {
    /* Empty */
}

let ls = [func1, func2, func3];

let ls2 = ls.slice(1, 3);

ls2[0]();
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: file:'<File file0.js>'
            to: function:'func2'
            loc: 17:1:6
```