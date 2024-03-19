# Declaration Merging

## Patterns

Interface-Interface

```ts
//        vvv
interface Foo {
    a: string;
}

//        vvv
interface Foo {
    b: string;
}

//        vvv
interface Foo {
    c: string;
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

**NOT** Namespace-Interface

> Ref: [Test Case](../../../../../docs/entity/namespace.md#access-namespaces-children)

```ts
namespace A {
    export type A = number
}

interface A {
    A: string
}

type b = A['A']   // interface A - property A
type c = A.A      // namespace A - type alias A
```

Namespace-ValueEntity (Function, Class, Enum)

> Ref: [Test Case](../../../../../docs/entity/namespace.md#merge-namespace-and-function)

```ts
function point(x: number, y: number): Point {
    return {x: x, y: y};
}

namespace point {
    export var origin = point(0, 0);

    export function equals(p1: Point, p2: Point) {
        return p1.x == p2.x && p1.y == p2.y;
    }
}
```

## Metrics

* #Usage
* MaxCount(Merging Elements)
* Types{Merging participants types}

## Tags

* typing
