import {e, r} from '../../../slim-container';
import ENREName from '@enre/naming';
import {logger} from '../../../logger';

export default (content: string) => {
  const raw = JSON.parse(content);

  // Manually add relation ids
  let relationId = 0;

  for (const ent of raw['variables']) {
    const extra = {} as any;
    let type = ent['category'] as string;

    // Package
    if (/Package/.test(type)) {
      type = 'package';
    }
    // Module
    else if (/Module/.test(type)) {
      type = 'module';
    }
    // Variable
    else if (/Variable/.test(type)) {
      type = 'variable';
    }
    // Function
    else if (/Function/.test(type) && !/Anonymous/.test(type)) {
      type = 'function';
    }
    // Parameter
    else if (/Parameter/.test(type)) {
      type = 'parameter';
    }
    // Class
    else if (/Class/.test(type)) {
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
    else if (/AnonymousFunction/.test(type)) {
      type = 'anonymousfunction';
    }
    // Unmatched
    else {
      logger.warn(`Unmapped type enre/python/entity/${type}`);
      continue;
    }

    const nameSegment = (ent['qualifiedName'] as string).split('.');
    let fullname = '';
    if (nameSegment.length === 1) {
      fullname = nameSegment[0];
    } else {
      for (let i = 1; i < nameSegment.length; i++) {
        if (i !== 1) {
          fullname += '.';
        }
        fullname += nameSegment[i];
      }
    }

    let name: any = nameSegment.at(-1);
    const testAnonymity = /\(\d+\)/.exec(name!);
    if (testAnonymity) {
      name = new ENREName('Anon', 'Function');
    } else {
      name = new ENREName('Norm', name);
    }

    e.add({
      id: ent['id'] as number,
      type: type,
      name: name,
      fullname,
      sourceFile: e.getById(ent['belongs_to']),
      location: {
        start: {
          line: ent['location']['startLine'],
          column: ent['location']['startColumn'],
        },
        end: {
          line: ent['location']['endLine'],
          column: ent['location']['endColumn'],
        },
      },
      ...extra,
    });
  }

  for (const rel of raw['cells']) {
    const extra = {} as any;
    let fromId = rel['src'];
    let type = rel['values']['kind'];
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
    else if (/Inherit/.test(type)) {
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
    // Unmapped
    else {
      logger.warn(`Unmapped type enre/python/relation/${type}`);
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
            line: rel['location']['startLine'],
            column: rel['location']['startCol'],
          },
        },
        ...extra,
      });
    } else {
      logger.warn(`Cannot find from/to entity that relation ${rel['from']}--${rel['type']}->${rel['to']} depends.`);
    }
  }
};
