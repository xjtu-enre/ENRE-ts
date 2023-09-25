import ENREName from '@enre/naming';
import {ENREEntityCollectionAll, ENREEntityPackage, id} from '@enre/data';
import {recordEntity} from '../../utils/wrapper';

export interface ENREEntityUnknown {
  name: ENREName<'Unk'> | ENREName<'Norm'>,
  parent: id<ENREEntityPackage> | id<ENREEntityUnknown>,
  children: ENREEntityUnknown[],
  type: 'unknown',
  role: 'default-export' | 'normal',

  getQualifiedName: () => string,
}

export const createEntityUnknown = (
  name: ENREEntityUnknown['name'],
  parent: ENREEntityUnknown['parent'],
  role: ENREEntityUnknown['role'] = 'normal',
): ENREEntityUnknown => {
  const children: ENREEntityUnknown['children'] = [];

  return {
    type: 'unknown' as const,

    name,

    parent,

    role,

    children,
    
    getQualifiedName() {
      let tmp = name.string;
      let cursor: ENREEntityCollectionAll | undefined = parent;

      while (cursor) {
        tmp = cursor.name.string + '.' + tmp;

        cursor = cursor.parent;
      }
      return tmp;
    },
  };
};

export const recordThirdPartyEntityUnknown = recordEntity(createEntityUnknown, 'third');
