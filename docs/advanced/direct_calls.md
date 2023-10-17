## Direct_calls

Functions establish a link between an upper entity and any other entities which are callable that the latter one is called within the former one's scope.

### Supported Patterns

```yaml
name: Advanced Direct_calls
```

#### Semantic: Direct calls

##### Examples

###### Call + Assigned call

```ts
function return_func {
    /* Empty */
}

function func(){
    const a= return_func;
    return a;
}

const a= func;
a()(); 

```

```yaml
relation:
    items:
        -   from: file:'<File file0.ts>'
            to: variable:'a'
            loc: 10:7:1
            type: set
            init: true
        -   from: file:'<File file0.ts>'
            to: function:'func'
            loc: 11:1:1
            type: call
            implicit: true
        -   from: function:'func'
            to: function:'return_func'
            loc: 6:12:1
            type: call
            implicit: true
        
```

###### Return call

```ts
function return_func(){
    function nested_return_func(){
        /* Empty */
    }
    return nested_return_func;
}

function func() {
    return return_func;
}

func()(); 
func()()(); 

```

```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: file:'<File file1.ts>'
            to: function:'func.return_func'
            loc: 12:1:4
            type: call
            implicit: true
        -   from: function:'func'
            to: function:'func.return_func.nested_return_func'
            loc: 12:1:4
            type: call
            implicit: true
```

###### Imported return call

```ts
function return_func(){
  /*Empty*/
}

function func() {
  return return_func;
}

export { func };

```
```ts
import { func } from './file2';

func()();

```

```yaml
relation:
    items:
        -   from: file:'<File file2.ts>'
            to: function:'func'
            loc: file2:9:1
            type: export
            kind: any
        -   from: file:'<File file3.ts>'
            to: function:'func'
            loc: file3:1:6
            type: import
        -   from: file:'<File file3.ts>'
            to: function:'func.return_func'
            loc: file3:3:4
            type: call
            implicit: true
```
##### With parameters
```ts
function func(){
    /* Empty */
}

function func2(a){
    return a;
}

function func3(){
    return func2;
}

func3()(func)(); 
```
```yaml
relation:
    type: call
    implicit: true
    items:
        -   from: file:'<File file4.ts>'
            to: function:'func3'
            loc: 13:1:4
        -   from: function:'func3'
            to: function:'func2'
            loc: 10:12:5
        -   from: function:'func2'
            to: function:'func'
            loc: 6:12:1
```
