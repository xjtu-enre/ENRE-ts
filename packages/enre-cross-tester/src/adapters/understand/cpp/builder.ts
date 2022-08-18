import {e, r} from '../../../slim-container';
import {warn} from '@enre/logging';
import {buildENREName, ENRENameAnonymous} from '@enre/naming';

export default (content: string) => {
  const raw = JSON.parse(content);

  switch (raw['script_ver']) {
    case 100: {
      for (const ent of raw['entities']) {
        if (ent['type'] === 'File') {
          let name = ent['name'] as string;
          name = name.substring(name.lastIndexOf('\\') + 1);

          e.add({
            id: ent['id'] as number,
            type: 'file',
            name,
            fullname: name,
          });
        } else {
          const extra = {} as any;
          let type = ent['type'] as string;

          /**
           * Map Understand schema to ENRE schema as possible
           */
          // Namespace
          if (/Namespace/.test(type) && !/Alias/.test(type)) {
            type = 'namespace';
          }
          // Alias
          else if (/Alias/.test(type)) {
            type = 'alias';
          }
          // Class
          else if (/Class/.test(type) && !/Template/.test(type)) {
            type = 'class';
          }
          // Struct
          else if (/Struct/.test(type) && !/Template/.test(type)) {
            type = 'struct';
          }
          // Union
          else if (/Union/.test(type)) {
            type = 'union';
          }
          // Macro
          else if (/Macro/.test(type)) {
            type = 'macro';
          }
          // Enum
          else if (/Enum Type/.test(type)) {
            type = 'enum';
          }
          // Enumerator
          else if (/Enumerator/.test(type)) {
            type = 'enumerator';
          }
          // Variable
          else if (/(Member )?Object (Global|Local)/.test(type) || /Parameter/.test(type)) {
            type = 'variable';
          }
          // Function
          else if (/Function/.test(type) && !/Template/.test(type)) {
            type = 'function';
          }
          // Template
          else if (/Template/.test(type)) {
            if (/Class/.test(type)) {
              extra.kind = 'Class Template';
            } else if (/Struct/.test(type)) {
              extra.kind = 'Struct Template';
            } else if (/Function/.test(type)) {
              extra.kind = 'Function Template';
            }

            type = 'template';
          }
          // Typedef
          else if (/Typedef Type/.test(type)) {
            type = 'typedef';
          }
          // Unmatched
          else {
            warn(`Unmapped type understand/cpp/entity/${type}`);
            continue;
          }

          /**
           * Handle anonymous entity
           */
          let name = ent['name'];
          const testAnonymity = /\(unnamed_(class|function)_\d+\)/.exec(ent['name']);
          if (testAnonymity) {
            if (testAnonymity[1] === 'class') {
              name = buildENREName<ENRENameAnonymous>({as: 'Class'});
            } else {
              name = buildENREName<ENRENameAnonymous>({as: 'Function'});
            }
          } else {
            name = buildENREName(name);
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
      }

      for (const rel of raw['relations']) {
        const extra = {} as any;
        let fromId = rel['from'];
        let type = rel['type'];
        let toId = rel['to'];

        // Alias
        if (/Alias/.test(type)) {
          type = 'alias';
        }
        // Call
        else if (/Call/.test(type)) {
          type = 'call';
        }
        // Define
        else if (/(Define|Declare)/.test(type)) {
          type = 'define';
        }
        // Exception
        else if (/Catch Exception/.test(type)) {
          type = 'exception';
        }
        // Extend
        else if (/Base/.test(type)) {
          type = 'extend';
        }
        // Friend
        else if (/Friend/.test(type)) {
          type = 'friend';
        }
        // Include
        else if (/Include/.test(type)) {
          type = 'include';
        }
        // Modify
        else if (/Modify/.test(type)) {
          type = 'modify';
        }
        // Override
        else if (/Overrides/.test(type)) {
          type = 'override';
        }
          // Parameter
        // Set
        else if (/Set/.test(type)) {
          type = 'set';
        }
        // Use
        else if (/Use/.test(type)) {
          type = 'use';
        }
        // Using
        else if (/Using/.test(type)) {
          type = 'using';
        }
        // Others
        else if (/(Typed|Name)/.test(type)) {
          // ...
        }
        // Unmapped
        else {
          warn(`Unmapped type understand/cpp/relation/${type}`);
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
              file: e.getById(rel['inFile']),
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
      break;
    }
    default:
      console.log(`Unhandled script version ${raw['script_ver']}`);
      return undefined;
  }
};
