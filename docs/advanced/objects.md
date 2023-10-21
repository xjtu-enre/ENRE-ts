## Objects

In JavaScript, objects can be used to achieve similar functionality. 

### Supported Patterns

```yaml
name: implicit objects
```

#### Semantic: objects

##### Examples

###### Chained Call

<!-- kwargs/chained_call -->

```js
function func3() {
    // Empty
}

function func2(a = func3) {
    a();
}

function func1(a, b = func2) {
    a(b);
}

func1({ a: func2, b: func3 });
```

```yaml
relation:
    type: call
    items:
        -   from: file:'<File file0.js>'
            to: function:'func1'
            loc: 13:1:5
        -   from: function:'func1'
            to: function:'func2'
            loc: 13:7:1
        -   from: function:'func2'
            to: function:'func3'
            loc: 6:5:1
            implicit: true
```

###### Call

<!-- kwargs/call -->

```js
function func4() {
    // Empty
}

function func2() {
    // Empty
}

function func3() {
    // Empty
}

function func(a, b, c) {
    a();
    b();
    c();
}

func(func2, func3, func4);
```

```yaml
relation:
    type: call
    items:
        -   from: file:'<File file0.js>'
            to: function:'func'
            loc: 19:1:4
        -   from: function:'func'
            to: function:'func2'
            loc: 19:6:4
        -   from: function:'func'
            to: function:'func3'
            loc: 19:13:4
            implicit: true
        -   from: function:'func'
            to: function:'func4'
            loc: 19:20:4
            implicit: true
```

###### Assigned Call

<!-- kwargs/assigned_call -->

```js
function func2() {
    // Empty
}

function func(a) {
    a();
}

const a = func;
const b = func2;
a({ a: b });
```

```yaml
relation:
    type: call
    items:
        -   from: file:'<File file0.js>'
            to: function:'func'
            loc: 11:1:1
            implicit: true
        -   from: function:'func'
            to: function:'func2'
            loc: 11:1:1
```