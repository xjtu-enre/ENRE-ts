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
    else if (/Namespace/.test(type)) {
      type = 'namespace';
    }
    // Alias
    else if (/Alias/.test(type)) {
      type = 'alias';
    }
    // Class
    else if (/Class/.test(type) && !/Template/.test(type)) {
      type = 'class';
    }
    // Struct
    else if (/Struct/.test(type) && !/Template/.test(type)) {
      type = 'struct';
    }
    // Union
    else if (/Union/.test(type)) {
      type = 'union';
    }
    // Macro
    else if (/Macro/.test(type)) {
      type = 'macro';
    }
    // Enum
    else if (/Enum$/.test(type)) {
      type = 'enum';
    }
    // Enumerator
    else if (/Enumerator/.test(type)) {
      type = 'enumerator';
    }
    // Variable
    else if (/Object/.test(type)) {
      type = 'variable';
    }
    // Function
    else if (/Function/.test(type) && !/Template/.test(type)) {
      type = 'function';
    }
    // Template
    else if (/Template/.test(type)) {
      if (/Class/.test(type)) {
        extra.kind = 'Class Template';
      } else if (/Struct/.test(type)) {
        extra.kind = 'Struct Template';
      } else if (/Function/.test(type)) {
        extra.kind = 'Function Template';
      }

      type = 'template';
    }
    // Typedef
    else if (/Typedef/.test(type)) {
      type = 'typedef';
    }
    // Unmatched
    else {
      warn(`Unmapped type enre/cpp/entity/${type}`);
      continue;
    }

    let name = ent['qualifiedName'];
    if (type === 'file') {
      name = name.substring(name.lastIndexOf('/') + 1);
    } else if (name.lastIndexOf('::') !== -1) {
      name = name.substring(name.lastIndexOf('::') + 2);
    }

    e.add({
      id: ent['id'] as number,
      type,
      name,
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
    if (/Alias/.test(type)) {
      type = 'alias';
    }
    // Call
    else if (/Call/.test(type)) {
      type = 'call';
    }
    // Define
    else if (/Define/.test(type)) {
      type = 'define';
    }
    // Exception
    else if (/Exception/.test(type)) {
      type = 'exception';
    }
    // Extend
    else if (/Extend/.test(type)) {
      type = 'extend';
    }
    // Friend
    else if (/Friend/.test(type)) {
      type = 'friend';
    }
    // Include
    else if (/Include/.test(type)) {
      type = 'include';
    }
    // Modify
    else if (/Modify/.test(type)) {
      type = 'modify';
    }
    // Override
    else if (/Override/.test(type)) {
      type = 'override';
    }
    // Parameter
    else if (/Parameter/.test(type)) {
      type = 'Parameter';
    }
    // Set
    else if (/Set/.test(type)) {
      type = 'set';
    }
    // Use
    else if (/Use/.test(type)) {
      type = 'use';
    }
    // Using
    else if (/Using/.test(type)) {
      type = 'using';
    }
    // Unmapped
    else {
      warn(`Unmapped type enre/cpp/relation/${type}`);
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
