# Script version definition, conforms to the SemiVer standard
self_ver = "1.0.0"

import understand
import argparse
import json
import sys
import re

# Usage
parser = argparse.ArgumentParser()
parser.add_argument('db', help='Specify Understand database name (not the full path)')
parser.add_argument('out', help='Specify output file\'s name and location')
parser.add_argument('target',
    help='e for entities only, r for relations only, and omit or a for all',
    nargs='?')
args = parser.parse_args()


def contain(keyword, raw):
    return bool(re.search(r'(^| )%s' % keyword, raw))


if __name__ == '__main__':
    und_ver = understand.version()

    print('Openning udb file...')
    db = understand.open(args.db)

    ent_list = []

    # Extract file entities first
    print('Exporting File entities...')
    file_count = 0
    for ent in db.ents('File'):
        # Filter only JavaScript files (denoted as Web)
        if ent.language() == 'Web':
            ent_list.append({
                'id': ent.id(),
                'type': 'File',
                # Relative name
                'name': ent.relname(),
            })
            file_count += 1
    print(f'Total {file_count} files are successfully exported')

    print('Exporting entities other that File...')
    regular_count = 0

    # Filter entities other than file
    for ent in db.ents('~File'):
        if ent.language() == 'Web':
            # Although a suffix 's' is added, there should be only
            # one entry that matches the condition
            decls = ent.refs('Definein')
            if decls:
                # Normal entities should have a ref definein contains location
                # about where this entity is defined
                line = decls[0].line()
                start_column = decls[0].column() + 1
                end_column = start_column + len(ent.simplename())
                ent_list.append({
                    'id': ent.id(),
                    'type': ent.kindname(),
                    'name': ent.longname(),
                    'line': line,
                    'start_column': start_column,
                    'end_column': end_column,
                    'belongs_to': decls[0].file().id(),
                })
                regular_count += 1
            else:
                print(
                    f'After {regular_count} successful append, an unseen situation occured')
                print(
                    ent.id(),
                    ent.kindname(),
                    ent.longname(),
                )
                all_ref_kinds = set()
                for ref in ent.refs():
                    all_ref_kinds.add(ref.kind().longname())
                print('All possible ref kinds are', all_ref_kinds)

                sys.exit(-1)

    all_ent_kinds = set()
    for ent in ent_list:
        all_ent_kinds.add(ent['type'])
    
    rel_list = []

    print('Exporting relations...')
    rel_count = 0
    for ent in db.ents():
        if ent.language() == 'Web':
            for ref in ent.refs('~End', '~Unknown ~Unresolved ~Implicit'):
                if ref.isforward():
                    rel_list.append({
                        'from': ref.scope().id(),
                        'to': ref.ent().id(),
                        # Using kind().longname() rather than kindname() to acquire longname
                        # in case meeting `Pointer` instead of `Use Ptr`
                        'type': ref.kind().longname(),
                        'line': ref.line(),
                        'column': ref.column()
                    })
                    rel_count += 1

    all_rel_kinds = set()
    for rel in rel_list:
        all_rel_kinds.add(rel['type'])

    print('Saving results to the file...')
    with open(args.out, 'w') as out:
        struct = {
            'script_ver': self_ver,
            'und_ver': und_ver,
            'db_name': args.db,
            'entities': ent_list,
            'relations': rel_list,
        }
        json.dump(struct, out, indent=4)
    print(f'Total {regular_count} entities and {rel_count} relations are successfully exported')
    print('All possible entity types are', sorted(all_ent_kinds))
    print('All possible relation types are', sorted(all_rel_kinds))
