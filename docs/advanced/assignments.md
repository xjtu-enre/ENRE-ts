## Assignments

xxx

### Supported Patterns

```yaml
name: Advanced assignments
```

#### Semantic:

##### Examples

###### Array literal destructuring

```js
function func1() {}
function func2() {}
function func3() {}

const [a, b] = [func1, func2];
a();
b();

const [x, [y, z]] = [func1, [func2, func3]];
x();
y();
z();
```

###### Array literal rest destructuring

```js
function func1() {}
function func2() {}
function func3() {}

const [a, ...b] = [func1, func2, func3];
b[0]();
b[1]();
```

##### Object literal destructuring

```js
function func1() {}
function func2() {}
function func3() {}

const {func1: a, func02: b} = {func1, func02: func2};
func1();
func2();
a();
b();

const {func1: x, func: {func2: y, func03: z}} = {func1, func: {func2, func03}};
x();
y();
z();
```

##### Object literal rest destructuring

```js

```
