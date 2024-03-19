# Overridden Type Parameter

## Patterns

> Ref:
> [Test Case](../../../../../docs/entity/type-parameter.md#duplicated-type-parameter-names)

```ts
//        v
class Clz<T> {
    //  v
    foo<T>(arg: T) {
        //      ^ The `T` of `arg` is method `foo`'s.
    }

    bar<T>(arg: T) {
        function baz<T>(arg1: T) {
            //                ^ The `T` of `arg1` is method `baz`'s.
        }
    }
}

interface Itf<T> {
    /* Empty */
}

class Clz2<T> {
    foo<U>(arg: U) {
        /* Empty */
    }
}
```

## Metrics

* #Usage%(Type Parameter)
* MaxCount(Overridden Type Parameter Chain Length)

## Tags

* typing
