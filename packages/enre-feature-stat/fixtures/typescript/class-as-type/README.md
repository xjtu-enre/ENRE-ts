# Class as Type

TypeScript Class is both value entity and type entity, thus can be used in type context.

## Patterns

```ts
class Foo {
    foo: string;
}

//       vvv
let clz: Foo;
let clz1: Foo['foo'];
let clz2: Pick<Foo, 'foo'>;

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

* #Usage%(Class Declaration)

## Tags

* typing
