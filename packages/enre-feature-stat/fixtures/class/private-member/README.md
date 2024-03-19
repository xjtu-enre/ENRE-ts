# Class Private Member

Class private member is a runtime behavior, neither the same to nor can be used with
TypeScript visibility modifiers.

Class private member name can only be identifier, no fancy allowed.

## Description

```js
class Foo {
    //vv
    #bar = 1;

    //vv
    #baz() {
        /* Empty */
    }

    //  vv
    get #a() {
        return 1;
    }

    //  vv
    set #a(v) {
        this.a = v;
    }
}
```

## Metrics

* #Usage%(Class, Class Member)

## Tags

* static
* new(JS2022)
