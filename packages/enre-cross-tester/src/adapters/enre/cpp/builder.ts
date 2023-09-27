import {e, r} from '../../../slim-container';
import {logger} from '../../../logger';
import ENREName from '@enre/naming';

export default (content: string) => {
  const raw = JSON.parse(content);

  // Manually add relation ids
  let relationId = 0;

  for (const ent of raw[0]['variables']) {
    const extra = {} as any;
    let type = ent['category'] as string;

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
    else if (/Variable/.test(type)) {
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
      logger.warn(`Unmapped type enre/cpp/entity/${type}`);
      continue;
    }

    let name = ent['qualifiedName'];
    if (type === 'file') {
      name = name.substring(name.lastIndexOf('/') + 1);
    } else if (name.lastIndexOf('::') !== -1) {
      name = name.substring(name.lastIndexOf('::') + 2);
    }
    if (name === '[unnamed]') {
      let as = ent['category'];
      if (as === 'Class Template') {
        as = 'Class';
      } else if (as === 'Struct Template') {
        as = 'Struct';
      } else if (as === 'Enum') {
        as = 'Enum';
      }
      name = new ENREName('Anon', as);
    }

    e.add({
      id: ent['id'] as number,
      type,
      name,
      location: {
        start: {
          line: ent['startLine'],
          column: ent['startOffset'],
        },
        end: {
          line: ent['endLine'],
          column: ent['endOffset'],
        },
      },
      ...extra,
    });
  }

  for (const rel of raw[0]['relations']) {
    const extra = {} as any;
    let fromId = rel['from'];
    let type = rel['category'];
    let toId = rel['to'];

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
    // Throw
    else if (/Exception/.test(type)) {
      type = 'Except';
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
    // Contain
    else if (/Contain/.test(type)) {
      type = 'contain';
    }
    // Unmapped
    else {
      logger.warn(`Unmapped type enre/cpp/relation/${type}`);
      continue;
    }

    const from = e.getById(fromId);
    const to = e.getById(toId);
    if (from && to) {
      r.add({
        id: relationId++,
        from,
        to,
        type,
        location: {
          file: undefined,
          start: {
            line: rel['loc']['line'],
            column: rel['loc']['offset'],
          },
        },
        ...extra,
      });
    } else {
      logger.warn(`Cannot find from/to entity that relation ${rel['from']}--${rel['category']}->${rel['to']} depends.`);
    }
  }
};
