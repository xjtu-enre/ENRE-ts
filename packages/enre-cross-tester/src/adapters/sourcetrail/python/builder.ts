import {e, r} from '../../../slim-container';
import {warn} from '@enre/logging';

export default (content: string) => {
  const raw = JSON.parse(content);

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
      warn(`Unmapped type sourcetrail/python/entity/${type}`);
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
    //   name = buildENREName<ENRENameAnonymous>({as: 'Function'});
    // } else {
    //   name = buildENREName(name);
    // }

    e.add({
      id: ent['id'] as number,
      type: type,
      name,
      fullname: qualifiedName,
      location: {
        start: {
          line: ent['line'],
          column: ent['start_column'],
        },
        end: {
          line: ent['line'],
          column: ent['end_column'],
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
      warn(`Unmapped type sourcetrail/python/relation/${type}`);
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
            line: rel['line'],
            column: rel['column'],
          },
        },
        ...extra,
      });
    } else {
      warn(`Cannot find from/to entity that relation ${rel['from']}--${rel['type']}->${rel['to']} depends.`);
    }
  }
};
