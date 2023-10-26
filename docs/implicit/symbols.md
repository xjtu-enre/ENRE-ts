## Symbols

JavaScript symbol usage can redirect certain code behavior to customized function.

### Supported Patterns

```yaml
name: Implicit Symbols
```

#### Semantic: Symbol

##### Examples

###### Iterator

```js
function func1() {
    console.log('func1')
};

function func2() {
    console.log('func2')
};

const foo = {};

foo[Symbol.iterator] = function* () {
    yield func1;
    yield func2;
};

for (const func of foo) {
    func();
}

const [...bar] = foo;
bar[0]();
bar[1]();
```

```yaml
relation:
  type: call
  implicit: true
  items:
    - from: file:'<File file0.js>'
      to: function:'func1'
      loc: 17:5:4
    - from: file:'<File file0.js>'
      to: function:'func2'
      loc: 17:5:4
    - from: file:'<File file0.js>'
      to: function:'func1'
      loc: 21:1:6
    - from: file:'<File file0.js>'
      to: function:'func2'
      loc: 22:1:6
```

###### Async iterator

```js
//// @ext mjs
function func1() {
    console.log('func1')
};

function func2() {
    console.log('func2')
};

function func3() {
    console.log('func3')
};

function func4() {
    console.log('func4')
};

const foo = [func1, func2];             // Overriden by iterator

foo[Symbol.iterator] = function* () {
    yield func2;
    yield func3;
}

foo[Symbol.asyncIterator] = async function* () {
    yield func3;
    yield func4;
}

for (const item of foo) {
    item();     // func2, func3
}

for await (const item of foo) {
    item();     // func3, func4
}
```

```yaml
relation:
  type: call
  implicit: true
  items:
    - from: file:'<File file0.mjs>'
      to: function:'func2'
      loc: 30:5:4
    - from: file:'<File file0.mjs>'
      to: function:'func3'
      loc: 30:5:4
    - from: file:'<File file0.mjs>'
      to: function:'func3'
      loc: 34:5:4
    - from: file:'<File file0.mjs>'
      to: function:'func4'
      loc: 34:5:4
    - from: file:'<File file0.mjs>'
      to: function:'func1'
      loc: 30:5:4
      negative: true
```
