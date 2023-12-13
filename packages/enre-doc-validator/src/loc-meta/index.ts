/**
 * String-representation of location
 *
 * Format:
 *   [<file index>:]<start line>:<start column>[[:<length>] [:<end line>:<end column>]]
 *
 * * `[<file index>:]` is the `fileX` format string where `X` is 0, 1, 2, ... like file index. This can be omitted only
 *   if code block count is 1.
 *
 * * `<start line>:<start column>` is the minimum structure that is needed.
 *
 * * `[:<length>]` is the entity name length, this can be omitted if name length can be calculated by entity.name.length,
 *   and is explicitly needed if it cannot be calculated or for noticing purpose.
 *
 * * `[:<end line>:<end column>]` is the most redundant form of the location representation, which addresses the exact
 *   4-number union, and is NOT needed in representing relation location.
 *
 * Examples:
 * * 1:1            - File index 0 start line 1 start column 1, end line and column are inferred from entity.name.
 * * file0:1:1      - File index 0 start line 1 start column 1, end line and column are inferred from entity.name.
 * * 1:1:5          - File index 0 start line 1 start column 1 end line 1 end column 1+5=6.
 * * file1:1:1:2:10 - File index 1 start line 1 start column 1 end line 2 end column 10.
 *
 * * 1              - File index 0 start line 1, this is for predicate describing purpose ONLY.
 * * file1          - File index 1, this is for predicate describing purpose ONLY.
 * * file1:1        - File index 1, start line 1, this is for predicate describing purpose ONLY.
 */
import ENREName from '@enre-ts/naming';

export interface LocSchema {
  file: number,
  start?: {
    line: number,
    column?: number,
  },
  end?: {
    line: number,
    column: number,
  }
}

export default (content: string, entityName?: ENREName<any>): LocSchema => {
  const fragments = content.split(':');

  let index = 0;
  if (fragments[0].startsWith('file')) {
    index = Number.parseInt(fragments[0].slice(4));
    if (isNaN(index)) {
      throw `Unexpected file index ${index} which is not a valid number`;
    }
    fragments.splice(0, 1);
  }

  const numberUnion = fragments.map(i => {
    const number = Number.parseInt(i);
    if (isNaN(number)) {
      throw `Unexpected location ${i} which is not a valid number`;
    }
    return number;
  });


  switch (numberUnion.length) {
    case 0:
      return {
        file: index,
      };

    case 1:
      return {
        file: index,
        start: {
          line: numberUnion[0],
        },
      };

    case 2:
      return {
        file: index,
        start: {
          line: numberUnion[0],
          column: numberUnion[1],
        },
        end: entityName ? {
          line: numberUnion[0],
          column: numberUnion[1] + entityName.codeLength,
        } : undefined,
      };
    case 3:
      return {
        file: index,
        start: {
          line: numberUnion[0],
          column: numberUnion[1],
        },
        end: {
          line: numberUnion[0],
          column: numberUnion[1] + numberUnion[2],
        },
      };
    case 4:
      return {
        file: index,
        start: {
          line: numberUnion[0],
          column: numberUnion[1],
        },
        end: {
          line: numberUnion[2],
          column: numberUnion[3],
        },
      };
    default:
      throw `Invalid location specifier count ${numberUnion.length}, expecting 0 / 1 / 2 / 3 / 4`;
  }
};
