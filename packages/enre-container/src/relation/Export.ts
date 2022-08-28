import {ENREEntityCollectionAll, ENREEntityFile} from '@enre/container';
import {ENRELocation} from '@enre/location';
import rGraph from '../container/r';
import {ENRERelationBase, recordRelationBase} from './Base';

export interface ENRERelationExport extends ENRERelationBase {
  readonly type: 'export',
  readonly kind: 'value' | 'type',
  readonly alias?: string,
  readonly isDefault: boolean,
}

export const recordRelationExport = (
  from: ENREEntityFile,
  to: ENREEntityCollectionAll,
  location: ENRELocation,
  {
    kind = 'value',
    alias,
    isDefault = false,
  }: Partial<Pick<ENRERelationExport, 'kind' | 'alias' | 'isDefault'>>
    = {kind: 'value', alias: undefined, isDefault: false}
) => {
  const _base = recordRelationBase(from, to, location);

  const _obj = {
    ..._base,

    get type() {
      return 'export' as const;
    },

    get kind() {
      return kind;
    },

    get alias() {
      return alias;
    },

    get isDefault() {
      return isDefault;
    },
  } as ENRERelationExport;

  rGraph.add(_obj);

  return _obj;
};
