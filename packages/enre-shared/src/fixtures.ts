export type sourceType = 'module' | 'script';
export type sourceLang = 'js' | 'ts' | 'json';

/**
 * The order impacts the efficiency of resolving import specifiers
 * that have no extension names. So we place the most common ones
 * to the front.
 */
export const supportedFileExt = ['.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs', '.mts', '.cts', '.json'] as const;

export type variableKind = 'let' | 'const' | 'var';
export type TSVisibility = 'public' | 'protected' | 'private';
export type methodKind = 'constructor' | 'method' | 'get' | 'set';
export type blockKind = 'any' | 'class-static-block';

export type symbolRole = 'any' | 'type';
