

```js
function func1() {
    console.log('func1')
};

function func2() {
    console.log('func2')
};

const iterable1 = {};

iterable1[Symbol.iterator] = function* () {
    yield func1;
    yield func2;
};

for (const func of iterable1) {
    func();
}
```

```yaml
relation:
  type: call
  implicit: true
  items:
    - from: file:'<File file0.js>'
      to: function:'func1'
      loc: 17:5:4
    - from: file:'<File file0.js>'
      to: function:'func2'
      loc: 17:5:4
```
###### Iterator Param
```js
function func(c) {
    for (let i of c) {
        /*Empty*/
    }
}

class Cls {
    constructor(max = 0) {
        this.max = max;
        this.n = 0;
    }

    [Symbol.iterator]() {
        return this;
    }

    next() {
        if (this.n > this.max) {
            return { done: true };
        }

        const result = 2 ** this.n;
        this.n++;
        return { value: result, done: false };
    }
}

func(new Cls());
```
```yaml
relation:
  type: call
  implicit: false
  items:
    - from: function:'func'
      to: method:'Cls.[Symbol.iterator]'
      loc: 28:1:4
```
###### Iter return
```js
function* generator(max) { //In the generated power value sequence
    for (let n = 0; n <= max; n++) {
        yield 2 ** n;
    }
}

class Cls {
    constructor(max = 0) {
        this.max = max;
        this.n = 0;
    }

    [Symbol.iterator]() {
        return this;
    }

    next() {
        if (this.n > this.max) {
            return { done: true };
        }

        const result = 2 ** this.n;
        this.n++;
        return { value: result, done: false };
    }
}

function func() {
    /*Empty*/
}

for (const val of new Cls()) {
    func(); // each 'func'
}

``` 
```yaml
relation:
  type: call
  implicit: false
  items:
    - from: file:'<File file2.js>'
      to: method'Cls.[Symbol.iterator]'
      loc: 32:23:3
    - from: file:'<File file2.js>'
      to: function'func'
      loc: 33:5:4
```
###### Iterable + Yeild
Test that all the methods of a generator are called.
```js
function* func(n) {
    let num = 0;
    while (num < n) {
        yield num;
        num++;
    }
}

for (const i of func(100)) {
    /*Empty*/
}

```
```yaml
relation:
  type: call
  implicit: false
  items:
    - from: file:'<File file3.js>'
      to: function'func'
      loc: 9:17:4
```

###### Iterable Assigned + Yeild
```js
class Cls {
    max: number;
    n: number;

    constructor(max: number = 0) {
        this.max = max;
        this.n = 0;
    }

    [Symbol.iterator]() {
        this.n = 0;
        return this;
    }

    next() {
        if (this.n > this.max) {
            return { done: true, value: undefined };
        }

        const result = 2 ** this.n;
        this.n++;
        return { done: false, value: this.n };
    }
}

const c = new Cls();

for (const i of c) {
    /*Empty*/
}
```
```yaml
relation:
  type: call
  implicit: true
  items:
    - from: file:'<File file4.js>'
      to: method'Cls.[Symbol.iterator]'
      loc: 25:17:1
```
###### No Iter
initialized but never itered

```js
class Cls {
    max: number;
    n: number;

    constructor(max: number = 0) {
        this.max = max;
        this.n = 0;
    }

    [Symbol.iterator]() {
        this.n = 0;
        return this;
    }

    next() {
        if (this.n > this.max) {
            throw new Error('StopIteration');// Error
        }

        const result = 2 ** this.n;
        this.n++;
        return result;
    }
}

const c = new Cls();

```
```yaml
relation:
  type: call
  implicit: true
  items:
    - from: file:'<File file5.js>'
      to: method'Cls.[Symbol.iterator]'
      loc: 26:7:1
```