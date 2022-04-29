## Relation: Import

In JavaScript's module system,

### Supported pattern

```yaml
name: importDeclaration
```

#### Syntax:

```text

```

**Examples:**

* A simple named import

```js
const foo = 0;
export default foo;
```

```js
import foo from 'file0.js';
```

```yaml
name: import
relation:
    filter: import
    items:
        -   src: @file1
            dest: @file0@variable[0]
            loc: [ 1, 8 ]
```

* Path as the import identifier

```js
// path/to/file0.js
const foo = 0;
export default foo;
```

```js
// path/file1.js
import foo from 'to/file0.js'
```

```yaml
name: pathAsImportIdentifier
relation:
    filter: import
    items:
        -   src: @file1
            dest: @file0@variable[0]
            loc: [ 1, 8 ]
```
