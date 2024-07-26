# Interface Multiple Extends

## Patterns (1)

```ts
//                    vvv  vvv
interface Foo extends Bar, Baz {
    /* Empty */
}

interface A extends B {
    /* Empty */
}

interface C {
    /* Empty */
}
```

## Metrics

* #Usage%(Interface Declaration With Heritage)
* MaxCount(Extends)

<!--* MaxCount(Conflict Members)-->
<!--* MaxCount(ExtendsChainLength)-->

## Tags

* typing
