// @ts-nocheck

import {e, r} from '../../../slim-container';
import {warn} from '@enre/logging';

export default ({entities, relations}: { entities: string, relations: string }) => {
  // Manually add relation ids
  let relationId = 0;

  for (const [index, ent_raw] of entities.split('\n').map(row => row.split(',')).entries()) {
    // csv header
    if (index === 0 || ent_raw.length === 1) {
      continue;
    }

    const ent = {
      id: parseInt(ent_raw[0]),
      type: ent_raw[1],
      name: ent_raw[2],
      parent_id: parseInt(ent_raw[3]),
    };

    const extra = {} as any;
    let type = ent.type as string;

    // Package
    if (/Package/.test(type)) {
      type = 'package';
    }
    // Module
    else if (/File/.test(type)) {
      type = 'module';
    }
    // Variable
    else if (/Variable/.test(type)) {
      type = 'variable';
    }
    // Function
    else if (/Function/.test(type)) {
      type = 'function';
    }
      // Parameter
    // Class
    else if (/Class/.test(type)) {
      type = 'class';
    }
      // Attribute
      // Alias
      // AnonymousFunction
    // Unmatched
    else {
      warn(`Unmapped type enre19/python/entity/${type}`);
      continue;
    }

    let sourceFile = undefined;
    let fullname = ent.name;
    if (type !== 'module' && type !== 'package') {
      sourceFile = e.getById(ent.parent_id);
      if (sourceFile.type === 'module') {
        fullname = sourceFile.name + '.' + ent.name;
      } else {
        fullname = sourceFile.fullname + '.' + fullname;
        sourceFile = sourceFile.sourceFile;
      }
    }

    let name = ent.name;
    if (type === 'module') {
      name = name.slice(name.lastIndexOf('/') + 1, name.length - 3);
    }

    e.add({
      id: ent.id,
      type,
      name,
      fullname,
      sourceFile,
      location: {
        start: {
          line: -1,
          column: -1,
        },
        end: {
          line: -1,
          column: -1,
        },
      },
      ...extra,
    });

    // Define
    r.add({
      id: relationId++,
      from: e.getById(ent.parent_id),
      to: e.getById(ent.id),
      type: 'define',
      location: {
        file: undefined,
        start: {
          line: -1,
          column: -1,
        },
      },
    });
  }

  for (const [index, rel] of relations.split('\n').map(row => row.split(',')).entries()) {
    if (index === 0 || rel.length === 1) {
      continue;
    }

    const extra = {} as any;
    let fromId = rel[0];
    let type = rel[3];
    let toId = rel[1];

    // Define
    // Use
    if (/Use/.test(type)) {
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
      warn(`Unmapped type enre19/python/relation/${type}`);
      continue;
    }

    const from = e.getById(parseInt(fromId));
    const to = e.getById(parseInt(toId));
    if (from && to) {
      r.add({
        id: relationId++,
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
      warn(`Cannot find from/to entity that relation ${rel[0]}--${rel[3]}->${1} depends.`);
    }
  }
};
