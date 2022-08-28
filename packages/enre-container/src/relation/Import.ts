import {ENREEntityCollectionAll, ENREEntityFile} from '@enre/container';
import {ENRELocation} from '@enre/location';
import rGraph from '../container/r';
import {ENRERelationBase, recordRelationBase} from './Base';

export interface ENRERelationImport extends ENRERelationBase {
  readonly type: 'import',
  readonly kind: 'value' | 'type',
  readonly alias?: string,
}

export const recordRelationImport = (
  from: ENREEntityFile,
  to: ENREEntityCollectionAll,
  location: ENRELocation,
  {
    kind = 'value',
    alias,
  }: Partial<Pick<ENRERelationImport, 'kind' | 'alias'>> = {kind: 'value'}
) => {
  const _base = recordRelationBase(from, to, location);

  const _obj = {
    ..._base,

    get type() {
      return 'import' as const;
    },

    get kind() {
      return kind;
    },

    get alias() {
      return alias;
    },
  } as ENRERelationImport;

  rGraph.add(_obj);

  return _obj;
};
