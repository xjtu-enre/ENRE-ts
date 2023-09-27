import {e, r} from '../../../slim-container';
import {logger} from '../../../logger';

export default (content: string) => {
  const raw = JSON.parse(content);

  for (const ent of raw[0]['variables']) {
    const extra = {} as any;
    let type = ent['entityType'] as string;

    // Package
    if (/Package/.test(type)) {
      type = 'package';
    }
    // Module
    else if (/File/.test(type)) {
      type = 'module';
    }
    // Variable
    else if (/Var/.test(type)) {
      type = 'variable';
    }
    // Function
    else if (/Function/.test(type)) {
      type = 'function';
    }
      // Parameter
    // Class
    else if (/Type/.test(type)) {
      type = 'class';
    }
    // Attribute
    else if (/Attribute/.test(type)) {
      type = 'attribute';
    }
    // Alias
    else if (/Alias/.test(type)) {
      type = 'alias';
    }
      // AnonymousFunction
    // Unmatched
    else {
      logger.warn(`Unmapped type depends/python/entity/${type}`);
      continue;
    }

    let name = ent['qualifiedName'] as string;
    if (type === 'package') {
      name = name.substring(name.lastIndexOf('\\') + 1);
    } else if (type === 'module') {
      name = name.substring(name.lastIndexOf('\\') + 1, name.lastIndexOf('.'));
    } else {
      name = name.substring(name.lastIndexOf('.') + 1);
    }

    // const testAnonymity = /\(\d+\)/.exec(name!);
    // if (testAnonymity) {
    //   name = new ENREName('Anon', 'Function');
    // } else {
    //   name = new ENREName('Norm', name);
    // }

    e.add({
      id: ent['id'] as number,
      type: type,
      name: name,
      location: {
        start: {
          line: ent['startLine'],
          column: ent['startColumn'] - 1,
        },
        end: {
          line: ent['endLine'],
          column: ent['endColumn'] - 1,
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

    // Define
    if (/Define/.test(type)) {
      type = 'define';
    }
    // Use
    else if (/Use/.test(type)) {
      type = 'use';
    }
    // Set
    else if (/Set/.test(type)) {
      type = 'set';
    }
    // Import
    else if (/Import/.test(type)) {
      type = 'import';
    }
    // Call
    else if (/Call/.test(type)) {
      type = 'call';
    }
    // Inherit
    else if (/Extend/.test(type)) {
      type = 'inherit';
    }
    // Contain
    else if (/Contain/.test(type)) {
      type = 'contain';
    }
    // Annotate
    else if (/Annotate/.test(type)) {
      type = 'annotate';
    }
    // Alias
    else if (/Alias/.test(type)) {
      type = 'alias';
    }
    // Others
    else if (/(Parameter|Annotation)/.test(type)) {
      // We should map a function--parameter->variable to a parameter entity,
      // however, depends does not save that variable entity.
      continue;
    }
    // Unmapped
    else {
      logger.warn(`Unmapped type depends/python/relation/${type}`);
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
      logger.warn(`Cannot find from/to entity that relation ${rel['from']}--${rel['type']}->${rel['to']} depends.`);
    }
  }
};
