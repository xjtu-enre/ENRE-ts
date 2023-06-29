export type sourceType = 'module' | 'script';
export type sourceLang = 'js' | 'ts';

export const supportedFileExt = ['.js', '.mjs', '.cjs', '.jsx', '.ts', '.mts', '.cts', '.tsx', '.json'] as const;

export type variableKind = 'let' | 'const' | 'var';
export type TSVisibility = 'public' | 'protected' | 'private';
export type methodKind = 'constructor' | 'method' | 'get' | 'set';
export type blockKind = 'any' | 'class-static-block';

export type symbolRole = 'any' | 'type';
