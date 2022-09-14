/**
 * Allowed types for `File` entity name.
 */
export const ENRENameFileTypes = [
  'js',
  'mjs',
  'cjs',
  'jsx',
  'ts',
  'd.ts',
  'mts',
  'cts',
  'tsx',
  'json',
] as const;

export type ENRENameFileType = typeof ENRENameFileTypes[number];

/**
 * An object representing properties needed by a file entity.
 */
export type ENRENameFile = {
  readonly base: string,
  /**
   * Indicates in which type of anonymous entity this is.
   */
  readonly ext: ENRENameFileType;
}
