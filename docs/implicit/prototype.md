## Prototype

The fundamental mechanism that powers object property inheritance and class inheritance.

`(function).prototype` sets the `__proto__` of the object created by `new function()`.

### Supported Patterns

```yaml
name: Implicit prototype
```

#### Semantic: Node.js Environment

##### Examples

###### Literal as prototype

```js
const foo = {};
foo.__proto__.a = function () {
    /* Empty */
};

foo.a();
```

```yaml
relation:
    type: call
    extra: false
    items:
        -   from: file:'<File file0.js>'
            to: function:'<Anon Function>'[@loc=2]
            loc: 6:5:1
            by: ~
```

###### Function's prototype

```js
function foo() {
    /* Empty */
}

foo.prototype.a = function () {
    /* Empty */
}

new foo().a();
```

```yaml
relation:
    type: call
    extra: false
    items:
        -   from: file:'<File file0.js>'
            to: function:'foo'
            loc: 9:5
        -   from: file:'<File file0.js>'
            to: function:'<Anon Function>'[@loc=5]
            loc: 9:11:1
            by: ~
```
