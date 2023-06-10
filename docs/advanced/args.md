## Args

xxx

### Supported Patterns

```yaml
name: Advanced args
```

#### Semantic: xxx

##### Examples

###### Function as parameter

```js
function paramFunc() { /* Empty */ }

function func(a) { a() }

func(paramFunc);

const b = paramFunc;
func(b);
```

###### Nested call

```js
function nestedFunc() { /* Empty */ }

function paramFunc(a) { a() }

function func(b) { b(nestedFunc) }

const c = paramFunc
const d = func
d(c)
```

###### With return

```js
function func(a) { a() }

function func2() { return func3 }

function func3() { /* Empty */ }

func(func2())
```
