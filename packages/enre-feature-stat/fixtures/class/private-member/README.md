# Class Private Member

Class private member is a runtime behavior, neither the same to nor can be used with
TypeScript visibility modifiers.

## Description

```js
class Foo {
    //vv
    #bar = 1;

    //vv
    #baz() {
        /* Empty */
    }
}
```

## Metrics

* #Usage%
