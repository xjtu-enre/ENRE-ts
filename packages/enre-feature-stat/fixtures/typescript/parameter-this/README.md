# `this` in Parameter

`this` is not a valid JavaScript parameter name, TypeScript utilizes this feature for
explicitly typing `this` variable in functions.

## Patterns (4)

```ts
//           vvvvvvvvvv
function foo(this: Type) {
    /* Empty */
}
```

```ts
class Parent {
    foo(this: Parent) {
        /* Empty */
    }
}

class Child extends Parent {
    //  vvvvvvvvvvvv
    bar(this: Parent) {
        /* Empty */
    }

    baz(this: Child) {
        /* Empty */
    }
}
```

## Metrics

* #Usage%(Function Declaration/Expression, Method Declaration)
* Types{ParentIsFunction, ParentIsMethod}
    * ParentIsFunction: The parent of this `this` parameter is a function
    * ParentIsMethod: The parent of this `this` parameter is a method
* Types{TypedAsContainingClass, TypedNotAsContainingClass} (Only applies to
  ParentIsMethod)
    * TypedAsContainingClass: The type of `this` is the same as the class
    * TypedNotAsContainingClass: The type of `this` is not the same as the class
* Index (Expected to be first)

## Tags

* typing
