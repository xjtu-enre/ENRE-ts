## Assignments

Functions are assigned to variables.

### Supported Patterns

```yaml
name: Implicit assignments
```

#### Semantic: Assignments

##### Examples

###### Basic assignments

<!-- assignments/chained -->

```js
const a = func1, b = func2;

a();
b();

// Declaration hoisting
function func1() {
    /* Empty */
}

function func2() {
    /* Empty */
}
```

```yaml
relation:
  type: call
  implicit: true
  items:
    - from: file:'<File file0.js>'
      to: function:'func1'
      loc: 3:1:1
    - from: file:'<File file0.js>'
      to: function:'func2'
      loc: 4:1:1
```

###### Array literal destructuring

<!-- assignments/tuple, assignments/recursive_tuple -->

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

const [a, b] = [func1, func2];
a();
b();

const [x, [y, z]] = [func1, [func2, func3]];
x();
y();
z();
```

```yaml
relation:
  type: call
  implicit: true
  items:
    - from: file:'<File file0.js>'
      to: function:'func1'
      loc: 14:1:1
    - from: file:'<File file0.js>'
      to: function:'func2'
      loc: 15:1:1
    - from: file:'<File file0.js>'
      to: function:'func1'
      loc: 18:1:1
    - from: file:'<File file0.js>'
      to: function:'func2'
      loc: 19:1:1
    - from: file:'<File file0.js>'
      to: function:'func3'
      loc: 20:1:1
```

###### Array literal rest destructuring

<!-- assignments/starred -->

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

const [a, ...b] = [func1, func2, func3];
b[0]();
b[1]();
```

```yaml
relation:
  type: call
  implicit: true
  items:
    - from: file:'<File file0.js>'
      to: function:'func2'
      loc: 14:1:4
    - from: file:'<File file0.js>'
      to: function:'func3'
      loc: 15:1:4
```

###### Object literal destructuring

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

const {func1: a, func02: b} = {func1, func02: func2};
a();
b();

const {func1: x, func: {func2: y, func03: z}} = {func1, func: {func2, func03}};
x();
y();
z();    // z is undefined
```

```yaml
relation:
  type: call
  implicit: true
  items:
    - from: file:'<File file0.js>'
      to: function:'func1'
      loc: 14:1:1
    - from: file:'<File file0.js>'
      to: function:'func2'
      loc: 15:1:1
    - from: file:'<File file0.js>'
      to: function:'func1'
      loc: 18:1:1
    - from: file:'<File file0.js>'
      to: function:'func2'
      loc: 19:1:1
```

###### Object literal rest destructuring

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

const {func1: a, ...func} = {func1, func2, func3};
a();
func.func2();
func.func3();

const {func1: x, func: {func2: y, ...z}} = {func1, func: {func2, func3}};
x();
y();
z.func3();
```

```yaml
relation:
  type: call
  implicit: true
  items:
    - from: file:'<File file0.js>'
      to: function:'func1'
      loc: 14:1:1
    - from: file:'<File file0.js>'
      to: function:'func2'
      loc: 15:1:10
    - from: file:'<File file0.js>'
      to: function:'func3'
      loc: 16:1:10
    - from: file:'<File file0.js>'
      to: function:'func1'
      loc: 19:1:1
    - from: file:'<File file0.js>'
      to: function:'func2'
      loc: 20:1:1
    - from: file:'<File file0.js>'
      to: function:'func3'
      loc: 21:1:7
```

###### Declaration expression within literal

```js
function func1() {
    /* Empty */
}

const [a, b, c] = [func1, function func2() {
    /* Empty */
}, class {
    method() {
        /* Empty */
    }
}]

a();
b();
new c().method();
```

```yaml
relation:
  type: call
  implicit: true
  items:
    - from: file:'<File file0.js>'
      to: function:'func1'
      loc: 13:1:1
    - from: file:'<File file0.js>'
      to: function:'func2'
      loc: 14:1:1
    - from: file:'<File file0.js>'
      to: class:'<Anon Class>'
      loc: 15:5:1
      # TODO: Is this an implicit call?
    - from: file:'<File file0.js>'
      to: method:'method'
      loc: 15:9
```
