## Relation: Import

An `Import Relation` establishes a link between a `File Entity`
and any other kinds of entity that the latter one is imported for
use.

### Supported Patterns

```yaml
name: Import declaration
```

#### Syntax: ESM Import

```text
ImportDeclaration :
    `import` ImportClause FromClause ;
    `import` ModuleSpecifier ;

ImportClause :
    ImportedDefaultBinding
    NameSpaceImport
    NamedImports
    ImportedDefaultBinding `,` NameSpaceImport
    ImportedDefaultBinding `,` NamedImports

ImportedDefaultBinding :
    ImportedBinding

NameSpaceImport :
    `*` `as` ImportedBinding

NamedImports :
    `{` `}`
    `{` ImportsList `}`
    `{` ImportsList `,` `}`

FromClause :
    `from` ModuleSpecifier

ImportsList :
    ImportSpecifier
    ImportsList , ImportSpecifier

ImportSpecifier :
    ImportedBinding
    ModuleExportName `as` ImportedBinding

ModuleSpecifier :
    StringLiteral

ImportedBinding :
    BindingIdentifier
```

##### Examples

#### Semantic: TypeScript ESM Type-Only Import

#### Semantic: CJS Import
