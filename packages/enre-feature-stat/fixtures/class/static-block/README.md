# Class Static Block

Class static block can be multiple, and they will be executed in the definition order.

## Patterns

```js
class Foo {
    //vvvvvv
    static {
        /* Empty */
    }

    foo() {
        /* Empty */
    }

    static {
        /* Empty */
    }
}

class Bar {
    static {
        /* Empty */
    }
}
```

## Metrics

* #Usage%(Class)
* MaxCount(Static block in a class)

## Tags

* new(ES2022)
* dynamic
