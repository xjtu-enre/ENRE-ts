/**
 * Allowed types for `Modified` entity name.
 */
export const ENRENameModifiedTypes = [
  'StringLiteral',
  'NumericLiteral',
  'PrivateIdentifier'
] as const;

export type ENRENameModifiedType = typeof ENRENameModifiedTypes[number];

/**
 * An object representing properties needed by a non-identifier entity.
 */
export type ENRENameModified = {
  readonly raw: string;
  readonly as: Exclude<ENRENameModifiedType, 'NumericLiteral'>;
} | {
  readonly raw: string;
  readonly as: 'NumericLiteral';
  /**
   * As for `NumericLiteral`, the value is normalized base 10 number(in string).
   */
  readonly value: string;
}
