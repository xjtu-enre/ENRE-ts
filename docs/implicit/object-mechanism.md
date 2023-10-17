## Object Mechanism

The fundamental structure of JavaScript objects.

### Supported Patterns

```yaml
name: Implicit object mechanism
```

#### Semantic: Callables

##### Examples

###### Function object

```js
function bar() {
    /* Empty */
}

function foo() {
    /* Empty */
}

foo.a = bar;

const {a} = foo;

a();
```

```yaml
relation:
  type: call
  implicit: true
  items:
    - from: file:'<File file0.js>'
      to: function:'bar'
      loc: 13:1:1
```
