## Symbol

JavaScript symbol usage can redirect certain code behavior to customized function.

### Supported Patterns

```yaml
name: implicit symbol
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

const iterable1 = {};

iterable1[Symbol.iterator] = function* () {
    yield func1;
    yield func2;
};

for (const func of iterable1) {
    func();
}
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
```