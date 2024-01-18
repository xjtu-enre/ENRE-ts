# Declaration Merging

## Patterns

Interface-Interface

```ts
//        vvv
interface Foo {
    a: string;
}

//        vvv
interface Bar {
    b: string;
}
```

Interface-Class

```ts
//        vvv
interface Foo {
    a: string;
}

//    vvv
class Foo {
    b: string;
}
```

Enum-Enum

```ts
//   vvv
enum Foo {
    a = 1,
}

//   vvv
enum Foo {
    b = 2,
}
```

Namespace-Namespace

```ts
//        vvv
namespace Foo {
    export const a = 1;
}

//        vvv
namespace Foo {
    export const b = 2;
}
```

## Metrics

* #Usage%
* Max merging element count
* If class is merged with interface
