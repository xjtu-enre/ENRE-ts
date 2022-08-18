import {e, r} from '../../../slim-container';
import {warn} from '@enre/logging';

export default (content: string) => {
  const raw = JSON.parse(content);

  for (const ent of raw[0]['variables']) {
    const extra = {} as any;
    let type = ent['entityType'] as string;

    // File
    if (/File/.test(type)) {
      type = 'file';
    }
    // Namespace
    else if (/Package/.test(type)) {
      type = 'namespace';
    }
      // Alias
    // Typedef
    else if (/Alias/.test(type)) {
      type = 'depends-aggregation';
    }
      // Class
      // Struct
      // Union
      // Enum
    // Template
    else if (/Type/.test(type)) {
      type = 'depends-aggregation';
    }
      // Enumerator
    // Variable
    else if (/Var/.test(type)) {
      type = 'depends-aggregation';
    }
    // Macro
    else if (/Function$/.test(type)) {
      type = 'macro';
    }
    // Function (FunctionImpl FunctionProto)
    else if (/Function/.test(type)) {
      type = 'function';
    }
    // Unmatched
    else {
      warn(`Unmapped type depends/cpp/entity/${type}`);
      continue;
    }

    let name = ent['qualifiedName'] as string;
    if (type === 'file') {
      name = name.substring(name.lastIndexOf('\\') + 1);
    } else {
      name = name.substring(name.lastIndexOf('.') + 1);
    }

    // const testAnonymity = /\(\d+\)/.exec(name!);
    // if (testAnonymity) {
    //   name = buildENREName<ENRENameAnonymous>({as: 'Function'});
    // } else {
    //   name = buildENREName(name);
    // }

    e.add({
      id: ent['id'] as number,
      type: type,
      name: name,
      location: {
        start: {
          line: ent['startLine'],
          column: ent['startColumn'],
        },
        end: {
          line: ent['endLine'],
          column: ent['endColumn'],
        },
      },
      ...extra,
    });
  }

  for (const rel of raw[0]['relations']) {
    const extra = {} as any;
    let fromId = rel['src'];
    let type = rel['type'];
    let toId = rel['dest'];

    // Alias
    // Call
    if (/Call/.test(type)) {
      type = 'call';
    }
    // Define
    else if (/Contain/.test(type)) {
      type = 'define';
    }
      // Exception
    // Extend
    else if (/Extend/.test(type)) {
      type = 'extend';
    }
      // Friend
      // Include
      // Modify
      // Override
      // Parameter
      // Set
    // Use
    else if (/Use/.test(type)) {
      type = 'use';
    }
      // Using
    // Unmapped
    else {
      warn(`Unmapped type depends/cpp/relation/${type}`);
      continue;
    }

    const from = e.getById(fromId);
    const to = e.getById(toId);
    if (from && to) {
      r.add({
        from,
        to,
        type,
        location: {
          file: undefined,
          start: {
            line: -1,
            column: -1,
          },
        },
        ...extra,
      });
    } else {
      warn(`Cannot find from/to entity that relation ${rel['from']}--${rel['type']}->${rel['to']} depends.`);
    }
  }
};
