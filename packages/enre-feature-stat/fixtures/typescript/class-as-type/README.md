# Class as Type

TypeScript Class is both value entity and type entity, thus can be used in type context.

## Patterns

```ts
class Foo {
    foo: string;
}

//       vvv
let clz: Foo;

//                   vvv
class Bar implements Foo {
    foo: string;
}

//                    vvv
interface Baz extends Foo {
    baz: string;
}
```

## Metrics

* #Usage%
