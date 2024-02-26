# Standalone Block

The standalone block is a block that is not part of any other structure. It creates a new
scope.

## Patterns

```ts
{
    /* Empty */
}

// Nesting blocks
{
    {
        {
            /* Empty */
        }
    }
}

// Named declarations inside
{
    const foo = 1;

    function bar() {
        /* Empty */
    }

    class Baz {
        /* Empty */
    }

    enum A {
        /* Empty */
    }

    interface I {
        /* Empty */
    }

    type T = number;

    // No namespace declaration
    // Because 'A namespace declaration is only allowed at the top level of a namespace or module.(1235)'
}

switch (true) {
    case true: {
        /* Empty */
    }
        console.log('a');
    {
        {
            /* Empty */
        }
    }
        break;

    case false: {
        /* Empty */
    }
}
```

## Metrics

* #Usage%(SwitchCaseUsageAgainstTotal)
* Type{DeclarationInside, NoDeclaration}
    * DeclarationInside: The standalone block contains declarations.
    * NoDeclaration`@intent?`: The standalone block does not contain declarations.
* Type{MultipleInSwitchCaseClause, SingleInSwitchCaseClause, NoneInSwitchCaseClause}
    * MultipleInSwitchCaseClause: There are multiple standalone blocks in the same switch
      case clause.
    * SingleInSwitchCaseClause: The switch case clause contains one standalone block.
    * NoneInSwitchCaseClause: The switch case clause contains no standalone block.
* MaxCount(NestingDepth)
* MaxCount(InSwitchCaseClause)

## Tags

* static
* corner-case
