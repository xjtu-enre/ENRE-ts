import {e, r} from '../../../slim-container';
import {warn} from '@enre/logging';
import {buildENREName, ENRENameAnonymous} from '@enre/naming';

export default (content: string) => {
  const raw = JSON.parse(content);

  // Manually add relation ids
  let relationId = 0;

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
      } else if (ent['type'] === 'Package') {
        e.add({
          id: ent['id'] as number,
          type: 'package',
          name: ent['name'],
          fullname: ent['name'],
        });
      } else {
        const extra = {} as any;
        let type = ent['type'] as string;

        /**
         * Map Understand schema to ENRE schema as possible
         */
        // Class
        if (/Class/.test(type) && !/Enum/.test(type) && !/Record/.test(type) && !/TypeVariable/.test(type)) {
          type = 'class';
        }
        // Enum
        else if (/Enum/.test(type)) {
          type = 'enum';
        }
        // Annotation
        else if (/Annotation/.test(type)) {
          type = 'annotation';
        }
          // AnnotationMember
          // else if (//.test(type)) {
          //   type = 'annotationmember';
          // }
        // Interface
        else if (/Interface/.test(type) && !/Annotation/.test(type)) {
          type = 'interface';
        }
        // Method
        else if (/Method/.test(type) && !/Abstract/.test(type)) {
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
        else if (/TypeVariable/.test(type)) {
          type = 'typeparameter';
        }
        // Variable
        else if (/Variable/.test(type)) {
          type = 'variable';
        }
        // Parameter
        else if (/Parameter/.test(type)) {
          type = 'variable';

          let parentId;
          for (const rel of raw['relations']) {
            if (rel.type === 'Java Define' && rel.to === ent['id']) {
              parentId = rel.from;
            }
          }

          if (parentId) {
            r.add({
              id: relationId++,
              from: parentId,
              to: ent['id'],
              type,
              location: {
                file: ent['belongs_to'],
                start: {
                  line: ent['line'],
                  column: ent['start_column'],
                },
              },
            });
          } else {
            warn('Cannot map parameter entity into parameter relation: Parent not found');
          }
        }
        // Unmatched
        else {
          warn(`Unmapped type understand/java/entity/${type}`);
          continue;
        }

        /**
         * Handle anonymous entity
         */
        let name = ent['name'];
        const testAnonymity = /\(Unnamed_(Package)_\d+\)/.exec(ent['name']);
        if (testAnonymity) {
          if (testAnonymity[1] === 'Package') {
            name = buildENREName<ENRENameAnonymous>({as: 'Package'});
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
        // Parameter
      // Typed
      else if (/Typed/.test(type)) {
        type = 'typed';
      }
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
      else if (/Annotate/.test(type)) {
        type = 'annotate';
      }
      // Cast
      else if (/Cast/.test(type)) {
        type = 'cast';
      }
      // Override
      else if (/Overrides/.test(type)) {
        type = 'override';
      }
        // Reflect
      // Define
      else if (/(Define|Declare)/.test(type)) {
        type = 'define';
      }
      // Others
      else if (/(Begin|Couple)/.test(type)) {
        // ...
        continue;
      }
      // Unmapped
      else {
        warn(`Unmapped type understand/java/relation/${type}`);
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
