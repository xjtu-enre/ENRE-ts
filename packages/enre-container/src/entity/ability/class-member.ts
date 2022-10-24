export type TSModifier = 'public' | 'protected' | 'private';

export interface ENREEntityAbilityClassMember {
  readonly isStatic: boolean;
  readonly isPrivate: boolean;
  /**
   * `Implicit` indicates this field is created through `this.*`,
   * which might not be presented at up-front class fields.
   */
  readonly isImplicit: boolean;
  readonly TSModifier?: TSModifier;
}
