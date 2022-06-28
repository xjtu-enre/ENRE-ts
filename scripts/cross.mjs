const {promisify} = await import('util');
const exec = promisify((await import('child_process')).exec);

export const available = async () => {
  try {
    const {stdout} = await exec('upython -V');
    return /Python 3\.\d+\.\d+/.test(stdout);
  } catch (e) {
    return false;
  }
};

export default async (dbpath) => {
  try {
    if (!await available()) {
      console.log('upython is not available, please check system\' environment path');
      return undefined;
    }
    const {stdout} = await exec(`upython cross/do.py -p ${dbpath} null`);
    return rebuildObjectGraph(JSON.parse(stdout));
  } catch (e) {
    console.log(e.message);
  }
};

/**
 * Convert numbered ID into reference to that entity object
 */
const rebuildObjectGraph = (raw) => {
  switch (raw['script_ver']) {
  case '1.0.0':
    const entityLookup = new Map();
    for (const ent of raw['entities']) {
      if (ent['type'] === 'File') {
        ent['entities'] = [];
        ent['relations'] = [];
        entityLookup.set(ent['id'], ent);
      } else {
        ent['relations'] = [];
        entityLookup.set(ent['id'], ent);
        entityLookup.get(ent['belongs_to']).entities.push(ent);
        const testAnonymity = /\(unnamed_(class|function)_\d+\)/.test(ent['name']);
        if (testAnonymity !== null) {
          ent['name'] = {isAnonymous: true, as: testAnonymity[1]};
        }
      }
    }
    for (const rel of raw['relations']) {
      rel['to'] = entityLookup.get(rel['to']);
      entityLookup.get(rel['from']).relations.push(rel);
    }
    break;
  default:
    console.log(`Unhandled script version ${raw['script_ver']}`);
    return undefined;
  }

  return raw;
};
