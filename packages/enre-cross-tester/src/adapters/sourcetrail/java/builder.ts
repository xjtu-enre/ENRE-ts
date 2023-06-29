import {e, r} from '../../../slim-container';
import {logger} from '../../../cli';

export default (content: string) => {
  const raw = JSON.parse(content);

  // Manually add relation ids
  let relationId = 0;

  for (const ent of raw['entities']) {
    const extra = {} as any;
    let type = ent['type'] as string;

    // Package
    if (/PACKAGE/.test(type)) {
      type = 'package';
    }
    // File
    else if (/FILE/.test(type)) {
      type = 'file';
    }
    // Class
    else if (/CLASS/.test(type)) {
      type = 'class';
    }
    // Enum
    else if (/ENUM/.test(type)) {
      type = 'enum';
    }
    // Annotation
    else if (/ANNOTATION/.test(type)) {
      type = 'annotation';
    }
    // AnnotationMember
    else if (/FIELD/.test(type)) {
      type = 'annotation member';
    }
    // Interface
    else if (/INTERFACE/.test(type)) {
      type = 'interface';
    }
    // Method
    else if (/METHOD/.test(type)) {
      type = 'method';
    }
      // Module
      // Record
    // TypeParameter
    else if (/TYPE_PARAMETER/.test(type)) {
      type = 'typeparameter';
    }
    // Variable
    else if (/Variable/.test(type)) {
      type = 'variable';
    }
    // Others
    else if (/BUILTIN_TYPE|UNKNOWN/.test(type)) {
      continue;
    }
    // Unmatched
    else {
      logger.warn(`Unmapped type sourcetrail/java/entity/${type}`);
      continue;
    }

    let name: any = ent['name'] as string;
    let qualifiedName = undefined;
    if (type === 'file') {
      name = name.substring(name.lastIndexOf('/') + 1);
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

    // Import
    if (/IMPORT/.test(type)) {
      type = 'import';
    }
    // Inherit
    else if (/INHERITANCE/.test(type)) {
      type = 'inherit';
    }
    // Implement
    else if (/Implement/.test(type)) {
      type = 'implement';
    }
    // Contain
    else if (/MEMBER/.test(type)) {
      type = 'contain';
    }
    // Call
    else if (/CALL/.test(type)) {
      type = 'call';
    }
    // Parameter
    else if (/Parameter/.test(type)) {
      type = 'parameter';
    }
      // Typed
      // else if (/TYPE_USAGE/.test(type)) {
      //   type = 'typed';
      // }
    // UseVar
    else if (/USAGE/.test(type)) {
      type = 'usevar';
    }
    // Set
    else if (/Set/.test(type)) {
      type = 'set';
    }
    // Modify
    else if (/Modify/.test(type)) {
      type = 'modify';
    }
    // Annotate
    else if (/Annotate/.test(type)) {
      type = 'annotate';
    }
    // Cast
    else if (/TYPE_USAGE/.test(type)) {
      type = 'cast';
    }
    // Override
    else if (/OVERRIDE/.test(type)) {
      type = 'override';
    }
    // Reflect
    else if (/Reflect/.test(type)) {
      type = 'reflect';
    }
    // Define
    else if (/Define/.test(type)) {
      type = 'define';
    }
    // Others
    else if (/UNKNOWN/.test(type)) {
      continue;
    }
    // Unmapped
    else {
      logger.warn(`Unmapped type sourcetrail/java/relation/${type}`);
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
      logger.warn(`Cannot find from/to entity that relation ${rel['from']}--${rel['type']}->${rel['to']} depends.`);
    }
  }
};
