/**
 * In `import type` and `export type`, they mean not filtering out non type entities,
 * which means `export type <a variable>` is still possible, just in the following usage there
 * would be a conflict that it cannot be used neither as a variable nor a type.
 */
export interface ENRERelationAbilityExplicitSymbolRole {
  readonly kind: 'any' | 'type',
}
