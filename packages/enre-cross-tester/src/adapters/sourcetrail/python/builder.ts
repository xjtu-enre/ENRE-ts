import {e, r} from '../../../slim-container';
import {logger} from '../../../logger';

export default (content: string) => {
  const raw = JSON.parse(content);

  // Manually add relation ids
  let relationId = 0;

  for (const ent of raw['entities']) {
    const extra = {} as any;
    let type = ent['type'] as string;

    // Package
    if (/MODULE/.test(type)) {
      type = 'package';
    }
    // Module
    else if (/FILE/.test(type)) {
      type = 'module';
    }
    // Variable
    else if (/VARIABLE/.test(type)) {
      type = 'variable';
    }
    // Function
    else if (/FUNCTION|METHOD/.test(type)) {
      type = 'function';
    }
      // Parameter
    // Class
    else if (/CLASS/.test(type)) {
      type = 'class';
    }
    // Attribute
    else if (/FIELD/.test(type)) {
      type = 'attribute';
    }
      // Alias
      // AnonymousFunction
    // Others
    else if (/UNKNOWN/.test(type)) {
      continue;
    }
    // Unmatched
    else {
      logger.warn(`Unmapped type sourcetrail/python/entity/${type}`);
      continue;
    }

    let name: any = ent['name'] as string;
    let qualifiedName = undefined;
    if (type === 'module') {
      name = name.substring(name.lastIndexOf('/') + 1, name.lastIndexOf('.'));
    } else {
      // Remove generic signature
      name = name.replaceAll(/<.*>/g, '');
      qualifiedName = name;
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
      name,
      fullname: qualifiedName,
      location: {
        start: {
          line: ent['line'],
          column: ent['start_column'] - 1,
        },
        end: {
          line: ent['line'],
          column: ent['end_column'] - 1,
        },
      },
      ...extra,
    });
  }

  for (const rel of raw['relations']) {
    const extra = {} as any;
    let fromId = rel['from'];
    let type = rel['type'];
    let toId = rel['to'];

    // Define
    if (/MEMBER/.test(type)) {
      type = 'define';
    }
    // Use
    else if (/USAGE/.test(type)) {
      type = 'use';
    }
    // Set
    else if (/Set/.test(type)) {
      type = 'set';
    }
    // Import
    else if (/IMPORT/.test(type)) {
      type = 'import';
    }
    // Call
    else if (/CALL/.test(type)) {
      type = 'call';
    }
    // Inherit
    else if (/INHERITANCE/.test(type)) {
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
    else if (/(OVERRIDE)/.test(type)) {
      // ...
    }
    // Unmapped
    else {
      logger.warn(`Unmapped type sourcetrail/python/relation/${type}`);
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
            line: rel['line'],
            column: rel['column'] - 1,
          },
        },
        ...extra,
      });
    } else {
      logger.warn(`Cannot find from/to entity that relation ${rel['from']}--${rel['type']}->${rel['to']} depends.`);
    }
  }
};
