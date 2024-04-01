## Functions

(High-Order Function) Function returns a function, or (Arrow Function) function
expression.

### Supported Patterns

```yaml
name: Implicit Functions
```

<!--pycg:direct_calls/imported_return_call unnecessary-->
<!--pycg:returns/return_complex unnecessary-->

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
        -   from: file:'<File file0.js>'
            to: function:'func'
            loc: 11:1:1
        -   from: file:'<File file0.js>'
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
        -   from: file:'<File file0.js>'
            to: function:'func'
            loc: 13:1
            implicit: false
        -   from: file:'<File file0.js>'
            to: function:'returnFunc'
            loc: 13:1:6
        -   from: file:'<File file0.js>'
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
        -   from: file:'<File file0.js>'
            to: function:'func3'
            loc: 13:1
            implicit: false
        -   from: file:'<File file0.js>'
            to: function:'func2'
            loc: 13:1:7
        -   from: file:'<File file0.js>'
            to: function:'func'
            loc: 13:1:13
```

#### Semantic: Arrow Function

##### Examples

###### Call to arrow function

<!--pycg:lambdas/call-->

```js
const x = x => x + 1;

x(1);
```

```yaml
relation:
    type: call
    items:
        -   from: file:'<File file0.js>'
            to: variable:'x'
            loc: 3:1
```

###### Call parameters

<!--pycg:lambdas/calls_parameter-->
<!--pycg:lambdas/parameter_call-->

```js
function func1() {
    /* Empty */
}

function func2() {
    /* Empty */
}

const x = x => x();

x(func1);
x(func2);

function func3(a) {
    a();
}

const y = x => x + 1;

func3(y);
func3(x => x + 1);
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: variable:'x'
            to: function:'func1'
            loc: 9:16:1
        -   from: variable:'x'
            to: function:'func2'
            loc: 9:16:1
        -   from: function:'func3'
            to: variable:'y'
            loc: 15:5:1
        -   from: function:'func3'
            to: function:'<Anon ArrowFunction>'[@loc=21:7]
            loc: 15:5:1
```

###### Arrow function as arguments

<!--pycg:lambdas/chained_calls-->

```js
function func3(a) {
    a()
}

function func2(a, b) {
    a();
    func3(b);
}

function func1(a, b, c) {
    a();
    func2(b, c);
}

func1(x => x + 1, x => x + 2, x => x + 3);
```

```yaml
relation:
    type: call
    items:
        -   from: file:'<File file0.js>'
            to: function:'func1'
            loc: 15:1
        -   from: function:'func1'
            to: function:'func2'
            loc: 12:5
        -   from: function:'func1'
            to: function:'<Anon ArrowFunction>'[@loc=15:7]
            loc: 11:5:1
            implicit: true
        -   from: function:'func2'
            to: function:'func3'
            loc: 7:5
        -   from: function:'func2'
            to: function:'<Anon ArrowFunction>'[@loc=15:19]
            loc: 6:5:1
            implicit: true
        -   from: function:'func3'
            to: function:'<Anon ArrowFunction>'[@loc=15:31]
            loc: 2:5:1
            implicit: true
```

###### Arrow function as returned value

<!--pycg:lambdas/return_call-->

```js
function func() {
    return x => x + 1;
}

const y = func();
y();
```

```yaml
relation:
    type: call
    items:
        -   from: file:'<File file0.js>'
            to: function:'func'
            loc: 5:11
        -   from: file:'<File file0.js>'
            to: function:'<Anon ArrowFunction>'[@loc=2:12]
            loc: 6:1:1
            implicit: true
```

#### Semantic: Returns

##### Examples

###### Call returned function

<!--pycg:returns/call-->
<!--pycg:returns/imported_call-->
<!--pycg:returns/nested_import_call-->

```js
export function returnFunc() {
    /* Empty */
}
```

```js
import {returnFunc} from 'file0.js'

export function func() {
    return returnFunc;
}
```

```js
import {func} from 'file1.js';

const a = func();
a();
```

```yaml
relation:
    type: call
    items:
        -   from: file:'<File file0.js>'
            to: function:'func'
            loc: file1:3:11
        -   from: file:'<File file0.js>'
            to: function:'returnFunc'
            loc: file1:4:1:1
            implicit: true
```
