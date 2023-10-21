## Decorators

A Decorate relation establishes a link between two entities that one callable entity decorate a class or class elements.

### Supported Patterns

```yaml
name: Advanced Decorators
```

#### Semantic: Decorators

##### Examples

###### Assigned + Call + Paremeter

<!-- decorators/call, decorators/parem_call, decorators/assigned -->

```ts
function dec1(f){
    return f;
}

function dec2(f){
    return f;
}

let a = dec1;
a = dec2;

@dec1
@dec2
function func(){
    /* Empty */
}

func();
```
        
```yaml
relation:
    items:
        -   from: function:'dec1'
            to: function:'func'
            loc: 14:10:4
            type: decorate
        -   from: function:'dec2'
            to: function:'func'
            loc: 14:10:4
            type: decorate
        -   from: function:'dec1'
            to: variable:'a'
            loc: 9:5:1
            type: type
        -   from: function:'dec2'
            to: variable:'a'
            loc: 10:1:1
            type: type
        -   from: function:'func'
            to: function:'dec1'
            loc: 18:1:4
            type: call
            implicit: true
        -   from: function:'func'
            to: function:'dec2'
            loc: 18:1:4
            type: call
            implicit: true
        -   from: function:'dec2'
            to: function:'func'
            loc: 18:1:4
            type: call
            implicit: true
```

###### Nested

<!-- decorators/nested -->

```ts
function dec(f): {
    return f;
}

function func(){
    function dec(f){
        return f;
    }

    @dec
    function inner(){
        /* Empty */
    }

    inner();
}

func();
```

```yaml
relation:
    items:
        -   from: function:'dec'
            to: function:'inner'
            loc: 10:6:3
            type: decorate
        -   from: function:'func'
            to: function:'dec'
            loc: 18:1:4
            type: call
            implicit: true
        -   from: function:'dec'
            to: function:'func.inner'
            loc: 18:1:4
            type: call
            implicit: true
```

###### Nested decorators

<!-- decorators/nested_decorators -->

```ts
function dec1(f){
    function inner(){
        return f();
    }
    return inner;
}

function dec2(){
    function inner(){
        return f();
    }
    return inner;
}

@dec1
@dec2
function func(){
    /* Empty */
}

func();
```

```yaml
relation:
    items:
        -   from: function:'dec1'
            to: function:'func'
            loc: 15:2:4
            type: decorate
        -   from: function:'dec2'
            to: function:'func'
            loc: 16:2:4
            type: decorate
        -   from: file:'<File file0.ts>'
            to: function:'dec1.inner'
            loc: 21:1:4
            type: call
            implicit: true
        -   from: function:'dec1.inner'
            to: function:'dec2.inner'
            loc: 2:14:5
            type: call
            implicit: true
        -   from: function:'dec2.inner'
            to: function:'func'
            loc: 17:10:4
            type: call
            implicit: true
```

###### Return different func

<!-- decorators/return_different_func -->

```ts
function dec(f){
    function inner(){
        f();
    }
    return inner;
}

@dec
function func(){
    /* Empty */
}

function func2() {
    func();
}

func2();
```

```yaml
relation:
    items:
        -   from: function:'dec'
            to: function:'func'
            loc: 8:2:3
            type: decorate
        -   from: function:'func2'
            to: function:'dec.inner'
            loc: 16:2:4
            type: call
            implicit: true
        -   from: function:'dec.inner'
            to: function:'func'
            loc: 2:14:5
            type: call
            implicit: true
        -   from: file:'<File file0.ts>'
            to: function:'func2'
            loc: 17:1:4
            type: call
            implicit: false
```