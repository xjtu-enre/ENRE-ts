## Entity: Block

A `Block Entity` is a declaration scope which is spanned by `{ ... }` and is a non-functional entity (class, function,
etc.).

### Supported Patterns

```yaml
name: Block statement
```

#### Syntax: Block Statement

```text
(Not class/enum/function/interface/method/namespace)
    `{` ... `}`
```

##### Examples

###### Control flow blocks

```js
if (true) {
    /* Empty */
} else {
    /* Empty */
}
```

```js
for (const foo of bar) {
    /* Empty */
}
```

```js
while (true) {
    /* Empty */
}
```

```js
// The switch statement does not create a block entity
switch (foo) {
    case 0:
        /* Empty */
        break;

    // A case statement can also be a block, where block-scope variables can be declared
    case 1: {
        /* Empty */
    }
}
```

```js
try {
    /* Empty */
} catch (error) {
    /* Empty */
} finally {
    /* Empty */
}
```

```js
// A standalone block is also valid (though meaningless)
{
    /* Empty */
}
```

```yaml
name: Control flow blocks
entity:
    type: block
    extra: false
    items:
        -   name: <Block 1:11>
            loc: file0:1:11
        -   name: <Block 3:8>
            loc: file0:3:8
        -   name: <Block 1:24>
            loc: file1:1:24
        -   name: <Block 1:14>
            loc: file2:1:14
        -   name: <Block 8:13>
            loc: file3:8:13
        -   name: <Block 1:5>
            loc: file4:1:5
        -   name: <Block 3:17>
            loc: file4:3:17
        -   name: <Block 5:11>
            loc: file4:5:11
        -   name: <Block 2:1>
            loc: file5:2:1
```

#### Syntax: Class Static Block

```text
ClassStaticBlock :
    `static` `{` ClassStaticBlockBody `}`
```

##### Examples

###### Class static block

```js
// A class entity, not a block entity
class Foo {
    // A block entity
    static {
        /* Empty */
    }

    // A method entity, not a block entity
    bar() {
        /* Empty */
    }
}
```

```yaml
name: Class static block
entity:
    type: block
    extra: false
    items:
        -   name: <Block 4:12>
            loc: 4:12
            kind: class-static-block
```

### Properties

| Name | Description                   |               type                | Default |
|------|-------------------------------|:---------------------------------:|:-------:|
| kind | The kind of the block entity. | `'any'` \| `'class-static-block'` | `'any'` |
