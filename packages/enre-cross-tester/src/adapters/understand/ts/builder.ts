import {e, r} from '../../../slim-container';
import {warn} from '@enre/logging';
import {buildENREName, ENREName, ENRENameAnonymous} from '@enre/naming';

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
          // Variable
          if (/Variable/.test(type)) {
            type = 'variable';
          }
          // Function
          else if (/Function/.test(type) && !/Method/.test(type)) {
            type = 'function';
          }
          // Parameter
          else if (/Parameter/.test(type) && !/Type/.test(type)) {
            type = 'parameter';
          }
          // Class
          else if (/Class/.test(type)) {
            type = 'class';
          }
          // Field or Class Method[getter/setter]
          else if (/Property/.test(type) && /Public|Protected|Private/.test(type)) {
            if (/Static/.test(type)) {
              extra.static = true;
            }

            if (/Public/.test(type)) {
              extra.TSModifier = 'public';
            } else if (/Protected/.test(type)) {
              extra.TSModifier = 'protected';
            } else if (/Private/.test(type)) {
              extra.TSModifier = 'private';
            }

            type = 'field';

            for (const rel of raw['relations']) {
              if (/Getter/.test(rel['type']) && rel['from'] === ent['id']) {
                type = 'method';
                extra.kind = 'get';
                break;
              } else if (/Setter/.test(rel['type']) && rel['from'] === ent['id']) {
                type = 'method';
                extra.kind = 'set';
                break;
              }
            }
          }
          // Method
          else if (/Method/.test(type)) {
            if (/Static/.test(type)) {
              extra.static = true;
            }

            if (/Public/.test(type)) {
              extra.TSModifier = 'public';
            } else if (/Protected/.test(type)) {
              extra.TSModifier = 'protected';
            } else if (/Private/.test(type)) {
              extra.TSModifier = 'private';
            }

            type = 'method';
          }
          // Property or Enum Member or Object Literal Method[getter/setter]
          else if (/Property/.test(type) && !/Public|Protected|Private/.test(type)) {
            type = 'property';

            for (const rel of raw['relations']) {
              if (/Getter/.test(rel['type']) && rel['from'] === ent['id']) {
                type = 'method';
                extra.kind = 'get';
                break;
              } else if (/Setter/.test(rel['type']) && rel['from'] === ent['id']) {
                type = 'method';
                extra.kind = 'set';
                break;
              }
            }
          }
          // Namespace
          else if (/Namespace/.test(type)) {
            type = 'namespace';
          }
          // Type Alias
          else if (/Type Alias/.test(type)) {
            type = 'type alias';
          }
          // Enum
          else if (/Enum/.test(type)) {
            type = 'enum';
          }
          // Interface
          else if (/Interface/.test(type)) {
            type = 'interface';
          }
          // Type Parameter
          else if (/Type Parameter/.test(type)) {
            type = 'type parameter';
          }
          // Others: Import Alias
          else if (/Import Alias/.test(type)) {
            /**
             * ENRE extracts it as a property of relation import,
             * this is handled by relation mapping
             */
          }
          // Unmatched
          else {
            warn(`Unmapped type understand/ts/entity/${type}`);
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

        // Import
        if (/Import/.test(type) || /Require/.test(type)) {
          if (/From/.test(type)) {
            continue;
          }

          type = 'import';

          for (const iRel of raw['relations']) {
            const aliasEnt = e.getById(iRel['to']);
            if (
              /Alias/.test(iRel['type'])
              && aliasEnt
              && iRel['from'] === rel['to']
              && iRel['inFile'] === rel['inFile']
              && iRel['line'] === rel['line']
            ) {
              extra.alias = (aliasEnt.name as ENREName).printableName;
              break;
            }
          }
        }
        // Export or Reexprot
        else if (/Declare Export/.test(type) || /Reexport/.test(type) || /Define (Default )?Export/.test(type)) {
          if (/Default/.test(type)) {
            extra.default = true;
          }

          if (/Define/.test(type)) {
            for (const iRel of raw['relations']) {
              const aliasEnt = e.getById(iRel['from']);
              if (/Alias/.test(iRel['type']) && aliasEnt && iRel['from'] === rel['to']) {
                toId = aliasEnt.id;
                extra.alias = (aliasEnt.name as ENREName).printableName;
                break;
              }
            }
          }

          type = 'export';
        }
        // Call
        else if (/Call/.test(type)) {
          if (/New/.test(type)) {
            extra.new = true;
          }

          type = 'call';
        }
        // Set
        else if (/Set/.test(type)) {
          if (/Init/.test(type)) {
            extra.init = true;
          }

          type = 'set';
        }
        // Use
        else if (/Use/.test(type)) {
          if (/Ptr/.test(type)) {
            // TODO: Web Javascript Use Ptr
          }

          type = 'use';
        }
        // Modify
        else if (/Modify/.test(type)) {
          type = 'modify';
        }
        // Extend
        else if (/Extend/.test(type)) {
          type = 'extend';
        }
        // Override
        else if (/Overrides/.test(type)) {
          type = 'override';
        }
        // Type
        else if (/Typed/.test(type)) {
          type = 'type';
          fromId = rel['to'];
          toId = rel['from'];
        }
        // Implement
        else if (/Implement/.test(type)) {
          type = 'implement';
        }
        // Others: Getter, Setter, Alias, Define
        else if (/Setter|Getter|Alias|Define/.test(type)) {
          /**
           * Setter and Getter is handled
           */
          continue;
        }
        // Unmapped
        else {
          warn(`Unmapped type understand/ts/relation/${type}`);
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
