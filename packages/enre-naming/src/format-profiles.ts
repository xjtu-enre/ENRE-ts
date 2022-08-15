/**
 * Format profile defines how ENRE output entity's name
 * if it is not a usual identifier.
 */

export enum FormatProfile {
  /**
   * **Default format**
   *
   * This will output anonymous entity and invalid identifier
   * as an XML string used in docs.
   */
  default,
  /**
   * **Understand format**
   *
   * This will output invalid identifier using SciTools Understand's format.
   */
  understand,
  /**
   * **Node format**
   *
   * This will output invalid identifier using node's format.
   */
  node,
}

export let currentProfile = FormatProfile.default;

export function usingNewFormatProfile(newFormat: FormatProfile) {
  currentProfile = newFormat;
}
