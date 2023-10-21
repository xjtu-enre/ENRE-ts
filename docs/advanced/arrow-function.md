## Arrow Functions

Arrow functions are functions defined using the arrow (=>) symbol, and they are commonly used to create anonymous functions or to pass as callback functions to other functions.

### Supported Patterns

```yaml
name: Advanced Arrow Functions
```

#### Semantic: Arrow Functions

##### Examples

###### Call + Chained call

<!-- lamdas/call, lamdas/chained_calls -->

```js
function func3(a) {
    a();
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
    implicit: true
    items:
        -   from: file:'<File file0.js>'
            to: function:'func1'
            loc: 15:1:5
        -   from: function:'func1'
            to: function:'func2'
            loc: 15:7:1
        -   from: function:'func2'
            to: function:'func3'
            loc: 7:5:4
```

###### Call Parameter

<!-- lamdas/call_paremeter -->

```js
const func1 = () => {
    /* Empty */
};

const func2 = () => {
    /* Empty */
};

const x = (callback) => {
    callback();
};

x(func1);
x(func2);
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
            loc: 14:1:1
```

###### Paremeter Call

<!-- lamdas/paremeter_call -->

```js
const func = (a) => {
    a();
};

const y = (x) => x + 1;

func(y);
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: file:'<File file0.js>'
            to: function:'func'
            loc: 7:1:4
```
###### Return

<!-- lamdas/return_call -->

```js
const func = () => (x: number) => x + 1;

const y = func();
y();
```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: file:'<File file0.js>'
            to: function:'func'
            loc: 4:1:1
```