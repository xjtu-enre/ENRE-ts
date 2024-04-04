## Symbols

JavaScript symbol usage can redirect certain code behavior to customized function.

> The full list of all `Symbol`s can be found
> at
> [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol).

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
    extra: false
    items:
        -   from: file:'<File file0.js>'
            to: function:'func1'
            loc: 17:5:4
            by: variable:'func'
        -   from: file:'<File file0.js>'
            to: function:'func2'
            loc: 17:5:4
            by: variable:'func'
        -   from: file:'<File file0.js>'
            to: function:'func1'
            loc: 21:1:6
            by: ~
        -   from: file:'<File file0.js>'
            to: function:'func2'
            loc: 22:1:6
            by: ~
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
    extra: false
    items:
        -   from: file:'<File file0.mjs>'
            to: function:'func2'
            loc: 30:5:4
            by: variable:'item'[@loc=29]
        -   from: file:'<File file0.mjs>'
            to: function:'func3'
            loc: 30:5:4
            by: variable:'item'[@loc=29]
        -   from: file:'<File file0.mjs>'
            to: function:'func3'
            loc: 34:5:4
            by: variable:'item'[@loc=33]
        -   from: file:'<File file0.mjs>'
            to: function:'func4'
            loc: 34:5:4
            by: variable:'item'[@loc=33]
```

###### Has instance

```js
class Array1 {
    static [Symbol.hasInstance](instance) {
        return Array.isArray(instance);
    }
}

console.log([] instanceof Array1);
// Expected output: true
```

```yaml
relation:
    type: call
    extra: false
    items:
        -   from: file:'<File file0.js>'
            to: method:'<Symbol hasInstance>'
            loc: 7:27:6
            by: ~
```

<!--TODO: More Symbols-->
