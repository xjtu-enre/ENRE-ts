import {e, r} from '../../../slim-container';
import {warn} from '@enre/logging';

export default (content: string) => {
  const raw = JSON.parse(content);

  // Manually add relation ids
  let relationId = 0;

  for (const ent of raw['entities']) {
    const extra = {} as any;
    let type = ent['type'] as string;

    // File
    if (/FILE/.test(type)) {
      type = 'file';
    }
    // Namespace
    else if (/NAMESPACE/.test(type)) {
      type = 'namespace';
    }
      // Alias
    // Class
    else if (/CLASS/.test(type)) {
      type = 'class';
    }
    // Struct
    else if (/STRUCT/.test(type)) {
      type = 'struct';
    }
    // Union
    else if (/UNION/.test(type)) {
      type = 'union';
    }
    // Macro
    else if (/MACRO/.test(type)) {
      type = 'macro';
    }
    // Enum
    else if (/ENUM$/.test(type)) {
      type = 'enum';
    }
    // Enumerator
    else if (/ENUM_CONSTANT/.test(type)) {
      type = 'enumerator';
    }
    // Variable
    else if (/VARIABLE|FIELD/.test(type)) {
      type = 'variable';
    }
    // Function
    else if (/FUNCTION|METHOD/.test(type)) {
      type = 'function';
    }
      // Template
    // Typedef
    else if (/TYPEDEF/.test(type)) {
      type = 'typedef';
    }
    // Others
    else if (/BUILTIN/.test(type)) {
      continue;
    }
    // Unmatched
    else {
      warn(`Unmapped type sourcetrail/cpp/entity/${type}`);
      continue;
    }

    let name: any = ent['name'] as string;
    let qualifiedName = undefined;
    if (type === 'file') {
      name = name.substring(name.lastIndexOf('/') + 1);
    } else {
      // Remove generic signature
      if (/<.*>/.test(name)) {
        name = name.replaceAll(/<.*>/g, '');
        type = 'template';
      }
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

    // Alias
    // Call
    if (/CALL|TEMPLATE_SPECIALIZATION/.test(type)) {
      type = 'call';
    }
    // Define
    else if (/MEMBER/.test(type)) {
      type = 'define';
    }
      // Exception
    // Extend
    else if (/INHERITANCE/.test(type)) {
      type = 'extend';
    }
      // Friend
    // Include
    else if (/INCLUDE/.test(type)) {
      type = 'include';
    }
      // Modify
    // Override
    else if (/OVERRIDE/.test(type)) {
      type = 'override';
    }
      // Parameter
      // Set
    // Use
    else if (/USAGE/.test(type)) {
      type = 'usa';
    }
      // Using
    // Others
    else if (/UNKNOWN/.test(type)) {
      continue;
    }
    // Unmapped
    else {
      warn(`Unmapped type sourcetrail/cpp/relation/${type}`);
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
