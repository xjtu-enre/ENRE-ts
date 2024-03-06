# Namespace Identifier Path

Namespace can only be declared within another namespace or at the top level.

## Patterns

> Ref: [Test Case](../../../../../docs/entity/namespace.md#use-identifier-path)

```ts
//        vvvvv
namespace X.Y.Z {
    /* Empty */
}

//        vvv
namespace X.Y {
    /* Empty */
}

namespace A {
    /* Empty */
}
```

## Metrics

* #Usage%(Namespace Declaration)
* #Usage(Namespaces With Overlapped Identifier Path)%(Identifier Path as Namespace's Name)
* MaxCount(IdentifierPath)

## Tags

* static
