/**
 * The first line of a code fence contains meta properties (if `////` presents)
 *
 * Format:
 *   //// [file path] [@no-test] [@ext <name>]
 *
 * * `////` indicates this line is for meta properties, and thus distinguished from regular comments.
 *
 * * `[file path]` is the path and file name of extracted code file, default is `file<x>.<lang>`
 *   under the top directory layer, where <x> is the index starting from 0, <lang> is the lang label of this fence.
 *   This is useful to customize file extension or override the default.
 *
 * * `[@no-test]` decorator indicates the whole example (including upcoming code fences) are for concept
 *   demonstration use only, and there is no need for testing it (since compile may fail etc.).
 *
 * * `[@ext <name>]` is a convenient method for adjust file extension name only (without path or filename modification),
 *   in which case, `name` should be appended immediately without the dot.
 *   This is conflict with `[file path]`, these two cannot show up at the same time.
 */

export interface FenceMeta {
  metaPresented: boolean;
  formatIssue: boolean;
  legacy: boolean;
  unknownDecorator: Array<string>;
  path?: string;
  ext?: string;
  noTest: boolean;
}

export default (lineContent: string): Readonly<FenceMeta> => {
  const result: FenceMeta = {
    metaPresented: false,
    formatIssue: false,
    legacy: false,
    unknownDecorator: [],
    noTest: false
  };

  const split = lineContent.split(' ');

  if (split[0].startsWith('////')) {
    result.metaPresented = true;

    // Remove the substring `////`
    if (split[0].length === 4) {
      split.splice(0, 1);
    } else {
      result.formatIssue = true;
      split[0] = split[0].substring(4);
    }

    for (let i = 0; i < split.length; i++) {
      const v = split[i];
      if (v.startsWith('@')) {
        switch (v.substring(1)) {
          case 'no-test':
            result.noTest = true;
            break;
          case 'ext':
            if (i + 1 === split.length) {
              // The expected `name` does not exist since this is the last fragment
              throw 'Missing extension name while @ext exists';
            } else if (v.startsWith('@')) {
              // The expected `name` does not exist since the next fragment starts with @
              throw 'Missing extension name while @ext exists or extension name cannot start with @';
            } else {
              // Consume the next fragment in advance, and skip it from the loop
              result.ext = split[i + 1];
              i += 1;
            }
            break;
          default:
            result.unknownDecorator.push(v);
            break;
        }
      } else {
        result.path = v;
      }
    }

    if (result.path && result.ext) {
      throw 'Path and extension name cannot be assigned at the same time';
    }
  } else if (split[0].startsWith('//')) {
    result.legacy = true;
  }

  return result;
};
