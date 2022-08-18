import {e, r} from '../../../slim-container';
import {warn} from '@enre/logging';

export default (content: string) => {
  const raw = JSON.parse(content);

  for (const ent of raw[0]['variables']) {
    const extra = {} as any;
    let type = ent['entityType'] as string;

    // Package
    if (/Package/.test(type)) {
      type = 'package';
    }
    // File
    else if (/File/.test(type)) {
      type = 'file';
    }
      // Class
      // Enum
      // Annotation
    // Interface
    else if (/Type/.test(type)) {
      type = 'depends-aggregation';
    }
      // Method
    // AnnotationMember
    else if (/Function/.test(type)) {
      type = 'annotationmember';
    }
      // Module
      // Record
      // TypeParameter
    // Variable
    else if (/Var/.test(type)) {
      type = 'variable';
    }
    // Unmatched
    else {
      warn(`Unmapped type depends/java/entity/${type}`);
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

    // Import
    if (/Import/.test(type)) {
      type = 'import';
    }
    // Inherit
    else if (/Extend/.test(type)) {
      type = 'inherit';
    }
    // Implement
    else if (/Implement/.test(type)) {
      type = 'implement';
    }
    // Contain
    else if (/Contain/.test(type)) {
      type = 'contain';
    }
    // Call
    else if (/Call/.test(type)) {
      type = 'call';
    }
      //Parameter
      // Typed
    // UseVar
    else if (/Use/.test(type)) {
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
    else if (/Annotation/.test(type)) {
      type = 'annotate';
    }
    // Cast
    else if (/Cast/.test(type)) {
      type = 'cast';
    }
      // Override
      // Reflect
    // Define
    else if (/Create/.test(type)) {
      type = 'create';
    }
    // Others
    else if (/Return/.test(type)) {
      // ...
    }
    // Unmapped
    else {
      warn(`Unmapped type depends/java/relation/${type}`);
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
