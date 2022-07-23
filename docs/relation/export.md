## Relation: Export

In JavaScript's module system,

### Supported Pattern

```yaml
name: Export declaration
```

#### Syntax:

```text

```

##### Examples

###### A simple named export

```js
const foo = 0;

export {foo};
```

```yaml
name: namedExport
relation:
    filter: export
    items:
        -   src: @file0
            dest: @variable[0]
            loc: file0:3:9
```
