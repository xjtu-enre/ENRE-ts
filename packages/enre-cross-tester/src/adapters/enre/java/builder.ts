import {e, r} from '../../../slim-container';
import {warn} from '@enre/logging';
import {buildENREName, ENRENameAnonymous} from '@enre/naming';

export default (content: string) => {
  const raw = JSON.parse(content);

  for (const ent of raw['variables']) {
    const extra = {} as any;
    let type = ent['category'] as string;

    // Package
    if (/Package/.test(type)) {
      type = 'package';
    }
    // File
    else if (/File/.test(type)) {
      type = 'file';
    }
    // Class
    else if (/Class/.test(type)) {
      type = 'class';
    }
    // Enum
    else if (/Enum$/.test(type)) {
      type = 'enum';
    }
    // EnumConstant
    else if (/Enum Constant/.test(type)) {
      type = 'enum constant';
    }
    // Annotation
    else if (/Annotation$/.test(type)) {
      type = 'annotation';
    }
    // AnnotationMember
    else if (/Annotation Member/.test(type)) {
      type = 'annotation member';
    }
    // Interface
    else if (/Interface/.test(type)) {
      type = 'interface';
    }
    // Method
    else if (/Method/.test(type)) {
      type = 'method';
    }
    // Module
    else if (/Module/.test(type)) {
      type = 'module';
    }
    // Record
    else if (/Record/.test(type)) {
      type = 'record';
    }
    // TypeParameter
    else if (/Type Parameter/.test(type)) {
      type = 'typeparameter';
    }
    // Variable
    else if (/Variable/.test(type)) {
      type = 'variable';
    }
    // Unmatched
    else {
      warn(`Unmapped type enre/java/entity/${type}`);
      continue;
    }

    // const nameSegment = (ent['qualifiedName'] as string).split('.');
    let fullname = ent['qualifiedName'];
    // if (nameSegment.length === 1) {
    //   fullname = nameSegment[0];
    // } else {
    //   for (let i = 1; i < nameSegment.length; i++) {
    //     if (i !== 1) {
    //       fullname += '.';
    //     }
    //     fullname += nameSegment[i];
    //   }
    // }

    let name: any = ent['name'];
    const testAnonymity = /Anonymous_(Class)/.exec(name!);
    if (testAnonymity) {
      name = buildENREName<ENRENameAnonymous>({as: 'Class'});
    } else {
      name = buildENREName(name);
    }

    e.add({
      id: ent['id'] as number,
      type: type,
      name,
      fullname,
      location: {
        start: {
          line: ent['location'] ? ent['location']['startLine'] : -1,
          column: ent['location'] ? ent['location']['startColumn'] : -1,
        },
        end: {
          line: ent['location'] ? ent['location']['endLine'] : -1,
          column: ent['location'] ? ent['location']['endColumn'] : -1,
        },
      },
      ...extra,
    });
  }

  for (const rel of (Array.isArray(raw['cells'])) ? raw['cells'] : (raw['cells'] ? [raw['cells']] : [])) {
    const extra = {} as any;
    let fromId = rel['src'];
    let type = rel['values'];
    let toId = rel['dest'];

    // Import
    if (type['Import'] === 1) {
      type = 'import';
    }
    // Inherit
    else if (type['Inherit'] === 1) {
      type = 'inherit';
    }
    // Implement
    else if (type['Implement'] === 1) {
      type = 'implement';
    }
    // Contain
    else if (type['Contain'] === 1) {
      type = 'contain';
    }
    // Call
    else if (type['Call'] === 1 || type['Call non-dynamic']) {
      type = 'call';
    }
    // Parameter
    else if (type['Parameter'] === 1) {
      type = 'parameter';
    }
    // Typed
    else if (type['Typed'] === 1) {
      type = 'typed';
    }
    // UseVar
    else if (type['UseVar'] === 1) {
      type = 'usevar';
    }
    // Set
    else if (type['Set'] === 1) {
      type = 'set';
    }
    // Modify
    else if (type['Modify'] === 1) {
      type = 'modify';
    }
    // Annotate
    else if (type['Annotate'] === 1) {
      type = 'annotate';
    }
    // Cast
    else if (type['Cast'] === 1) {
      type = 'cast';
    }
    // Override
    else if (type['Override'] === 1) {
      type = 'override';
    }
    // Reflect
    else if (type['Reflect'] === 1) {
      type = 'reflect';
    }
    // Define
    else if (type['Define'] === 1) {
      type = 'define';
    }
    // Unmapped
    else {
      warn(`Unmapped type enre/java/relation/${JSON.stringify(type)}`);
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
            line: rel['values']['loc']['startLine'],
            column: rel['values']['loc']['startCol'],
          },
        },
        ...extra,
      });
    } else {
      warn(`Cannot find from/to entity that relation ${rel['from']}--${rel['type']}->${rel['to']} depends.`);
    }
  }
};
