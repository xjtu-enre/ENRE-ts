import {e, r} from '../../../slim-container';
import {warn} from '@enre/logging';
import {buildENREName, ENRENameAnonymous} from '@enre/naming';

export default (content: string) => {
  const raw = JSON.parse(content);

  // Manually add relation ids
  let relationId = 0;

  for (const ent of raw['entities']) {
    const type = ent['type'];

    let name = ent['name'];

    const testFileXml = /<File base="(.+)" ext="(.+)">/.exec(name);

    if (testFileXml !== null) {
      name = `${testFileXml[1]}.${testFileXml[2]}`;
    }

    e.add({
      id: ent['id'] as number,
      type,
      name,
      fullname: ent['fullname'],
      sourceFile: type !== 'file' ? e.getById(ent['sourceFile']) : undefined,
      location: type !== 'file' ? {
        start: {
          line: ent['location']['start']['line'],
          column: ent['location']['start']['column'],
        },
        end: {
          line: ent['location']['end']['line'],
          column: ent['location']['end']['column'],
        },
      } : undefined,
    });
  }

  for (const rel of raw['relations']) {
    const from = e.getById(rel['from']);
    const to = e.getById(rel['to']);
    if (from && to) {
      r.add({
        id: relationId++,
        from,
        to,
        type: rel['type'],
        location: {
          file: undefined,
          start: {
            line: rel['location']['line'],
            column: rel['location']['column'],
          },
        },
      });
    } else {
      warn(`Cannot find from/to entity that relation ${rel['from']}--${rel['type']}->${rel['to']} depends.`);
    }
  }
};
