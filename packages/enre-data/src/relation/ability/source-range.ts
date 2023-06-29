import {ENRELocation} from '@enre/location';

export interface ENRERelationAbilitySourceRange {
  /**
   * All import and re-export relations should possess this property to
   * indicate the code range of `from 'xxx'`.
   */
  readonly sourceRange: ENRELocation,
}
