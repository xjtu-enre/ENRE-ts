import {e, r} from '../../../slim-container';
import ENREName from '@enre/naming';
import {logger} from '../../../cli';

export default (content: string) => {
  const raw = JSON.parse(content);

  // Manually add relation ids
  let relationId = 0;

  switch (raw['script_ver']) {
    case 100: {
      for (const ent of raw['entities']) {
        if (ent['type'] === 'File') {
          let name = ent['name'] as string;
          name = name.substring(name.lastIndexOf('\\') + 1, name.lastIndexOf('.'));

          e.add({
            id: ent['id'] as number,
            type: 'module',
            name,
            fullname: name,
          });
        } else {
          const extra = {} as any;
          let type = ent['type'] as string;

          /**
           * Map Understand schema to ENRE schema as possible
           */
          // Package
          if (/Package/.test(type)) {
            type = 'package';
          }
          // Variable
          else if (/Variable/.test(type) && !/Attribute/.test(type)) {
            type = 'variable';

            for (const iRel of raw['relations']) {
              if (iRel['type'] === 'Python Alias' && iRel['to'] === ent['id']) {
                type = 'alias';
              }
            }
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
            logger.warn(`Unmapped type understand/python/entity/${type}`);
            continue;
          }

          /**
           * Handle anonymous entity
           */
          let name = ent['name'];

          // D:\ENRE-other\enre-py\tests\cases\_parameterdefinition\_parameterdefinition\test_parameter.py.t
          if (name.indexOf('.') !== -1 && !name.endsWith('.py')) {
            name = name.substring(name.lastIndexOf('.') + 1);
          }

          const testAnonymity = /\(unnamed_(class|function)_\d+\)/.exec(ent['name']);
          if (testAnonymity) {
            if (testAnonymity[1] === 'class') {
              name = new ENREName('Anon', 'Class');
            } else {
              name = new ENREName('Anon', 'Class');
            }
          } else {
            name = new ENREName('Norm', name);
          }

          e.add({
            id: ent['id'] as number,
            type: type,
            name: name,
            fullname: ent['qualified_name'],
            sourceFile: e.getById(ent['belongs_to']),
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
      }

      for (const rel of raw['relations']) {
        const extra = {} as any;
        let fromId = rel['from'];
        let type = rel['type'];
        let toId = rel['to'];

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
        else if (/Typed/.test(type)) {
          type = 'annotate';
        }
        // Alias
        else if (/Alias/.test(type)) {
          type = 'alias';

          // Reverse src and dest
          const tmp = fromId;
          fromId = toId;
          toId = tmp;
        }
        // Others
        else if (/(Typed|Couple|Raise|Overrides)/.test(type)) {
          // ...
        }
        // Unmapped
        else {
          logger.warn(`Unmapped type understand/python/relation/${type}`);
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
              file: e.getById(rel['inFile']),
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
      break;
    }
    default:
      logger.error(`Unhandled script version ${raw['script_ver']}`);
      return undefined;
  }
};
