## Object Literal
In TypeScript, you can use object literals to create objects for the purpose of function invocation.

### Supported Patterns

```yaml
name: Advanced Object Literal
```

#### Semantic: Object Literal

##### Examples

###### Add key

```ts
function func() {
    /*Empty*/
}

const d = {};

d["b"] = func;
d["b"](); // func

```

```yaml
relation:
    items:
        -   from: file:'<File file0.ts>'
            to: variable:'d'
            loc: 5:7:1
            type: set
            init: true
        -   from: file:'<File file0.ts>'
            to: variable:'d'
            loc: 7:1:6
            type: set
        -   from: file:'<File file0.js>'
            to: function:'func'
            loc: 7:1:6
            type: call
            implicit: true
```

###### Assign

```ts
function func1() {
    /*Empty*/
}

function func2(){
    /*Empty*/
}

const d = {
    "a": func1,
};

d["a"] = func2;

d["a"](); // 调用函数 func2

```

```yaml
relation:
    items:
        -   from: file:'<File file1.ts>'
            to: variable:'d'
            loc: 5:7:1
            type: set
            init: true
        -   from: file:'<File file1.ts>'
            to: variable:'d'
            loc: 7:1:6
            type: set
        -   from: file:'<File file1.ts>'
            to: function:'func'
            loc: 7:1:6
            type: call
            implicit: true 
```

##### Call

```ts
function func1(){
    /*Empty*/
}

function func2(): void {
    /*Empty*/
}

const d = {
    "a": func1,
    "1": func2, // Use strings as keys to match
    "2": 3,    // 2: 3 is not a function, so it can't be called
};

d["a"]();
d["1"]();
```

```yaml
relation:
    items:
        -   from: file:'<File file2.ts>'
            to: variable:'d'
            loc: 9:7:1
            type: set
            init: true
        -   from: file:'<File file2.ts>'
            to: function:'func1'
            loc: 15:1:6
            type: call
            implicit: true
        -   from: file:'<File file2.ts>'
            to: function:'func2'
            loc: 16:1:6
            type: call
            implicit: true 
```

##### Ext key

```ts
export const key = "a";  //file3
```
```ts
import { key } from "./file3"; 

function func(){
    /*Empty*/
}

const d:= {
    "a": func,
};

d[key](); 
```
```yaml
relation:
    items:
        -   from: file:'<File file3.ts>'
            to: variable:'key'
            loc: file3:1:7
            type: set
            init: true
        -   from: file:'<File file4.ts>'
            to: variable:'key'
            loc: file4:1:10
            type: import
        -   from: alias:'key'
            to: variable:'variable'
            loc: file4:1:10
            type: aliasof
        -   from: file:'<File file4.ts>'
            to: function:'func'
            loc: file4:11:1
            type: call
            implicit: true
```
##### Nested
```ts
function func1(){
    /* Empty */
}

function func2() {
    /* Empty */
}

const d:  = {
    "a": {
        "b": func1,
    },
};

d["a"]["b"] = func2;
d["a"]["b"](); // func2
```
```yaml
relation:
    items:
        -   from: file:'<File file5.ts>'
            to: variable:'d'
            loc: 9:7:1
            type: set
            init: true
        -   from: file:'<File file5.ts>'
            to: variable:'d'
            loc: 15:1:11
            type: set
        -   from: file:'<File file5.ts>'
            to: function:'func1'
            loc: 16:1:11
            type: call
            implicit: true
```
##### Param + New key param
```ts
function func2(){
    /* Empty */
}

function func(key= 'a') {
    d[key] = func2;
}

const d = {};

func();
d['a'](); //func2
```
```yaml
relation:
    items:
        -   from: file:'<File file5.ts>'
            to: variable:'d'
            loc: 9:7:1
            type: set
            init: true
        -   from: file:'<File file5.ts>'
            to: function:'func.d'
            loc: 11:1:4
            type: call
            implicit: true
        -   from: file:'<File file5.ts>'
            to: function:'func2'
            loc: 12:1:6
            type: call
            implicit: true
```
##### Return assign
```ts
function func2(): void {
    /* Empty */
}

function func1(){
    return func2;
}

const d = {
    "a": func1(),
};

d["a"](); // func2
```
```yaml
relation:
    items:
        -   from: file:'<File file6.ts>'
            to: variable: 'd'
            loc: 9:7:1
            type: set
            init: true
        -   from: file:'<File file6.ts>'
            to: function:'func1'
            loc: 13:1:6
            type: call
            implicit: true
        -   from: function:'func1'
            to: function:'func2'
            loc: 13:1:6
            type: call
            implicit: true         
```
##### Type coercion
```ts
function func1(){
    /* Empty */
}

function func2(){
    /* Empty */
}

const d= {
    "1": func1,
    1: func2, // Using strings and numbers as keys
};

d[1](); // func2
```
```yaml
relation:
    items:
        -   from: file:'<File file7.ts>'
            to: variable: 'd'
            loc: 9:7:1
            type: set
            init: true
        -   from: file:'<File file7.ts>'
            to: function:'func2'
            loc: 14:1:4
            type: call
            implicit: true   
```