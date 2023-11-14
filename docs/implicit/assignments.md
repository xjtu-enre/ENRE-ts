## Assignments

Functions are assigned to variables.

### Supported Patterns

```yaml
name: Implicit Assignments
```

<!--pycg:functions/call explicit-->
<!--pycg:functions/imported_call unnecessary-->
<!--pycg:functions/assigned_call_lit_param unnecessary-->

#### Semantic: Assignments

##### Examples

###### Basic assignments

<!--pycg:functions/assigned_call-->
<!--pycg:assignments/chained-->

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
        -   from: file:'<File file0.js>'
            to: function:'func1'
            loc: 3:1:1
        -   from: file:'<File file0.js>'
            to: function:'func2'
            loc: 4:1:1
```

###### Chained assignments

```js
function func() {
    /* Empty */
}

const a = func;
const b = a;
const c = b;
c();

const x = func, y = x, z = y;
z();
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: file:'<File file0.js>'
            to: function:'func'
            loc: 8:1:1
        -   from: file:'<File file0.js>'
            to: function:'func'
            loc: 11:1:1
```

###### Array literal destructuring

<!--pycg:assignments/tuple-->
<!--pycg:assignments/recursive_tuple-->

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
        -   from: file:'<File file0.js>'
            to: function:'func1'
            loc: 14:1:1
        -   from: file:'<File file0.js>'
            to: function:'func2'
            loc: 15:1:1
        -   from: file:'<File file0.js>'
            to: function:'func1'
            loc: 18:1:1
        -   from: file:'<File file0.js>'
            to: function:'func2'
            loc: 19:1:1
        -   from: file:'<File file0.js>'
            to: function:'func3'
            loc: 20:1:1
```

###### Array literal rest destructuring

<!--pycg:assignments/starred-->

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
        -   from: file:'<File file0.js>'
            to: function:'func2'
            loc: 14:1:4
        -   from: file:'<File file0.js>'
            to: function:'func3'
            loc: 15:1:4
```

###### Object literal destructuring

<!--pycg:assignments/tuple-->

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
        -   from: file:'<File file0.js>'
            to: function:'func1'
            loc: 14:1:1
        -   from: file:'<File file0.js>'
            to: function:'func2'
            loc: 15:1:1
        -   from: file:'<File file0.js>'
            to: function:'func1'
            loc: 18:1:1
        -   from: file:'<File file0.js>'
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
        -   from: file:'<File file0.js>'
            to: function:'func1'
            loc: 14:1:1
        -   from: file:'<File file0.js>'
            to: function:'func2'
            loc: 15:1:10
        -   from: file:'<File file0.js>'
            to: function:'func3'
            loc: 16:1:10
        -   from: file:'<File file0.js>'
            to: function:'func1'
            loc: 19:1:1
        -   from: file:'<File file0.js>'
            to: function:'func2'
            loc: 20:1:1
        -   from: file:'<File file0.js>'
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
        -   from: file:'<File file0.js>'
            to: function:'func1'
            loc: 13:1:1
        -   from: file:'<File file0.js>'
            to: function:'func2'
            loc: 14:1:1
        -   from: file:'<File file0.js>'
            to: class:'<Anon Class>'
            loc: 15:5:1
            # TODO: Is this an implicit call?
        -   from: file:'<File file0.js>'
            to: method:'method'
            loc: 15:9
```

###### Rest assignment clarify

Rest assignments works differently in object context and array context.

In array context, it only collects elements with keys that can be evaluated to numbers,
that is, string keys are ignored.

```js
function func1() {
    /* Empty */
};

function func2() {
    /* Empty */
};

function func3() {
    /* Empty */
};

function func4() {
    /* Empty */
};

const foo = [func1, func2];
foo['prop'] = func3;
foo[2] = func4;
// `foo` becomes [func1, func2, func4, 'prop': func3]
const [foo0, ...foo1] = foo;
foo0();                 // func1
foo1[0]();              // func2, the index was reset to 0
foo1['prop']();         // Invalid
foo1[1]();              // func4

const bar = {0: func1, 1: func2};
bar['prop'] = func3;
// `bar` becomes {0: func1, 1: func2, 'prop': func3}
const {0: bar0, ...bar1} = bar;
bar0();                 // func1
bar1[0]();              // Invalid, in object it is not index but string key 0 -> '0', thus not reset to 0
bar1[1]();              // func2
bar1['prop']();         // func3
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: file:'<File file0.js>'
            to: function:'func1'
            loc: 22:1:4
        -   from: file:'<File file0.js>'
            to: function:'func2'
            loc: 23:1:7
        -   from: file:'<File file0.js>'
            to: function:'func3'
            loc: 24:1:12
            negative: true
        -   from: file:'<File file0.js>'
            to: function:'func4'
            loc: 25:1:7
        -   from: file:'<File file0.js>'
            to: function:'func1'
            loc: 31:1:4
        -   from: file:'<File file0.js>'
            to: function:'func2'
            loc: 32:1:7
            negative: true
        -   from: file:'<File file0.js>'
            to: function:'func2'
            loc: 33:1:7
        -   from: file:'<File file0.js>'
            to: function:'func3'
            loc: 34:1:12
```

###### Default values

```js
function func1() {
    /* Empty */
}

function func2() {
    /* Empty */
}

const [a, b = func2] = [func1];
a();
b();

const {
    x, y: z = function func3() {
        /* Empty */
    }
} = {x: func1};
x();
z();
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: file:'<File file0.js>'
            to: function:'func1'
            loc: 10:1:1
        -   from: file:'<File file0.js>'
            to: function:'func2'
            loc: 11:1:1
        -   from: file:'<File file0.js>'
            to: function:'func1'
            loc: 18:1:1
        -   from: file:'<File file0.js>'
            to: function:'func3'
            loc: 19:1:1
```
