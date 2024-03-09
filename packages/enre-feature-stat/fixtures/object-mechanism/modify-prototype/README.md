# Prototype Modification

## Patterns

```js
//     vvvvvvvvvvvvvvvvvvv
String.prototype.newFunc = function () {
    /* Empty */
}

function foo() {
    /* Empty */
}

foo.prototype.a = 0;

class Bar {
    /* Empty */
}

Bar.prototype.b = 'Hello';
```

## Metrics

* #Usage
* Types{ModifyClass, ModifyFunction, ModifyBuiltIn}
    * ModifyClass: The modification is to a class
    * ModifyFunction: The modification is to a function
    * ModifyBuiltIn: The modification is to a built-in object
* Types{AddedEntityType}

## Tags

* implicit
* dynamic
