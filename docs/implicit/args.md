## Args

Callables are passed as arguments to other functions and are called in the form of parameters.

### Supported Patterns

```yaml
name: Implicit Args
```

#### Semantic: Simple Args

##### Examples

###### Function pass as argument

<!--pycg:args/call-->

```js
function paramFunc() {
    /* Empty */
}

function func(a) {
    a()
}

func(paramFunc);
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: function:'func'
            to: function:'paramFunc'
            loc: 6:5:1
```

###### Function pass as argument 2

<!--pycg:args/assigned_call-->

```js
function paramFunc() {
    /* Empty */
}

function func(a) {
    a()
}

const b = paramFunc;
func(b);
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: function:'func'
            to: function:'paramFunc'
            loc: 6:5:1
```

###### Nested call

<!--pycg:args/nested_call-->

```js
function nestedFunc() {
    /* Empty */
}

function paramFunc(a) {
    a()
}

function func(a) {
    a(nestedFunc)
}

const b = paramFunc;
const c = func;
c(b);
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: file:'<File file0.js>'
            to: function:'func'
            loc: 15:1:1
        -   from: function:'func'
            to: function:'paramFunc'
            loc: 10:5:1
        -   from: function:'paramFunc'
            to: function:'nestedFunc'
            loc: 6:5:1
```

###### Param call

<!--pycg:args/param_call-->

```js
function func(a) {
    a()
}

function func2() {
    return func3
}

function func3() {
    /* Empty */
}

func(func2());
```

```yaml
relation:
    type: call
    items:
        -   from: file:'<File file0.js>'
            to: function:'func'
            loc: 13:1
        -   from: file:'<File file0.js>'
            to: function:'func2'
            loc: 13:6
        -   from: function:'func'
            to: function:'func3'
            loc: 2:5:1
            implicit: true
```

###### Function importing

<!--pycg:args/imported_call-->

```js
export function func(a) {
    a()
}
```

```js
import {func} from './file0.js';

function paramFunc() {
    /* Empty */
}

func(paramFunc);
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: function:'func'
            to: function:'paramFunc'
            loc: 2:5:1
```

###### Function importing with alias

```js
function func(a) {
    a()
}

export {func as foo};
```

```js
import {foo as func1} from './file0.js';

function paramFunc() {
    /* Empty */
}

func1(paramFunc);
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: function:'func'
            to: function:'paramFunc'
            loc: 2:5:1
```

###### Function importing with assignment

<!--pycg:args/imported_assigned_call-->

```js
export function func(a) {
    a()
}
```

```js
import {func} from './file0.js';

function paramFunc() {
    /* Empty */
}

const a = paramFunc;
const b = func;
b(a);
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: function:'func'
            to: function:'paramFunc'
            loc: 2:5:1
```

###### Declarations as arguments

```js
function foo(a) {
    a()
}

foo(function () {
    /* Empty */
})

foo(() => {
    /* Empty */
})
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: function:'foo'
            to: function:'<Anon Function>'[@loc=5]
            loc: 2:5:1
        -   from: function:'foo'
            to: function:'<Anon ArrowFunction>'[@loc=9]
            loc: 2:5:1
```

#### Semantic: Destructing Args

##### Examples

###### Destructuring pattern

```js
function func1() {
    /* Empty */
}

function func2() {
    /* Empty */
}

function func([a, b], {func1: c, func2: d}) {
    a();
    b();
    c();
    d();
}

func([func1, func2], {func1, func2});
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: function:'func'
            to: function:'func1'
            loc: 10:5:1
        -   from: function:'func'
            to: function:'func2'
            loc: 11:5:1
        -   from: function:'func'
            to: function:'func1'
            loc: 12:5:1
        -   from: function:'func'
            to: function:'func2'
            loc: 13:5:1
```

###### Rest operator

```js
function func1() {
    /* Empty */
}

function func2() {
    /* Empty */
}

function func(a, ...r) {
    r[0]();
    r[1].func1();
    r[2][0]();
}

func(func1, func2, {func1}, [func2]);
// `r` is [func2, {func1}, [func2]]
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: function:'func'
            to: function:'func2'
            loc: 10:5:4
        -   from: function:'func'
            to: function:'func1'
            loc: 11:5:10
        -   from: function:'func'
            to: function:'func2'
            loc: 12:5:7
```

###### Destructuring complex usage

```js
function func1() {
    /* Empty */
}

function func2() {
    /* Empty */
}

function func({a: [funcA]}, [, {b: funcB}], ...r) {
    funcA();
    funcB();
    r[1]();
}

func({a: [func1]}, [func1, {b: func2}], func1, func2);
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: function:'func'
            to: function:'func1'
            loc: 10:5:5
        -   from: function:'func'
            to: function:'func2'
            loc: 11:5:5
        -   from: function:'func'
            to: function:'func2'
            loc: 12:5:4
```

#### Semantic: Default Args

##### Examples

###### Args default values

<!--pycg:kwargs/call-->
<!--pycg:kwargs/assigned_call-->
<!--pycg:kwargs/chained_call-->

```js
function func3() {
    /* Empty */
}

function func2(a = func3) {
    a()
}

function func1(a, b = func2) {
    a(b)
}

const a = func2, b = func3;

func1(a, b)
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: file:'<File file0.js>'
            to: function:'func1'
            loc: 15:1
            implicit: false
        -   from: function:'func1'
            to: function:'func2'
            loc: 10:5:1
        -   from: function:'func2'
            to: function:'func2'
            loc: 6:5:1
        -   from: function:'func2'
            to: function:'func3'
            loc: 6:5:1
```

###### Default complex usage

```js
function func1() {
    /* Empty */
}

function func2() {
    /* Empty */
}

function func({a: [funcA] = [func1]}, [, {b: funcB} = {b: func2}], c = [func1]) {
    funcA();
    funcB();
    c[0]();
}

func({b: [func2]}, [func2]);
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: function:'func'
            to: function:'func1'
            loc: 10:5:5
        -   from: function:'func'
            to: function:'func2'
            loc: 11:5:5
        -   from: function:'func'
            to: function:'func1'
            loc: 12:5:4
```

#### Semantic: Implicit Args

In despite of declared parameters, a function can access all arguments passed in through the specific object
variable `arguments`.
See [this MDN doc](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments).

Cannot be used within an arrow function.

##### Examples

###### Implicit args

```js
function func1() {
    /* Empty */
}

function func() {
    arguments[0]();
}

func(func1);
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: function:'func'
            to: function:'func1'
            loc: 6:5:12
```
