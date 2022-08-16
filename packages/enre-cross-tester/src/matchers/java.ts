import {CaseContainer} from '@enre/doc-parser';
import {createMatchResultContainer, MatchResult} from './match-result';
import {e} from '../slim-container';
import {GeneralEntity} from '../slim-container/e';
import {warn} from '@enre/logging';
import {GeneralRelation} from '../slim-container/r';

export default (cs: CaseContainer): MatchResult => {
  const result = createMatchResultContainer();

  let noExtraOn = cs.assertion.entity?.extra === false ? cs.assertion.entity.type : undefined;

  for (const i of cs.assertion.entity?.items || []) {
    let fetched: GeneralEntity[] | undefined = undefined;

    switch (i.type) {
      case 'package':
        fetched = e.where({
          type: i.type,
          name: i.name.printableName,
        });

        if (fetched) {
          if (fetched.length === 1) {
            if (i.negative === true) {
              result.entity.unexpected += 1;
            } else {
              result.entity.fullyCorrect += 1;
            }
          } else if (fetched.length === 0) {
            if (i.negative === true) {
              result.entity.fullyCorrect += 1;
            } else {
              result.entity.missing += 1;
            }
          } else {
            warn('Insufficient predicates to determine only one entity');
          }
        } else {
          result.entity.missing += 1;
        }
        break;

      case 'file':
        break;

      case 'class':
        break;

      case 'enum':
        break;

      case 'annotation':
        break;

      case 'annotationmember':
        break;

      case 'interface':
        break;

      case 'method':
        break;

      case 'module':
        break;

      case 'record':
        break;

      case 'typeparameter':
        break;

      case 'variable':
        break;
    }
  }

  noExtraOn = cs.assertion.relation?.extra === false ? cs.assertion.relation.type : undefined;

  for (const i of cs.assertion.relation?.items || []) {
    let inFileIndex = i.to.predicates?.loc?.file;
    let inFile: GeneralEntity | undefined = undefined;

    if (inFileIndex !== undefined) {
      const path = cs.code[inFileIndex].path;
      const fileName = path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.'));
      inFile = e.where({type: 'file', name: fileName})![0];
    }

    const eFrom = e.where({
      type: i.from.type,
      name: i.from.isFullName ? undefined : i.from.name,
      fullname: i.from.isFullName ? i.from.name : undefined,
      inFile: i.from.type === 'file' ? undefined : inFile,
    });

    if (eFrom?.length !== 1) {
      if (['enum', 'interface'].includes(i.from.type)) {
        result.relation.wrongNode += 1;
      } else {
        warn('Insufficient or wrong predicates to determine only one [from] entity');
      }
      break;
    }

    inFileIndex = i.to.predicates?.loc?.file;
    inFile = undefined;

    if (inFileIndex !== undefined) {
      const path = cs.code[inFileIndex].path;
      const fileName = path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.'));
      inFile = e.where({type: 'file', name: fileName})![0];
    }

    const eTo = e.where({
      type: i.to.type,
      name: i.to.isFullName ? undefined : i.to.name,
      fullname: i.to.isFullName ? i.to.name : undefined,
      inFile: i.to.type === 'file' ? undefined : inFile,
    });

    if (eTo?.length !== 1) {
      if (['enum', 'interface'].includes(i.to.type)) {
        result.relation.wrongNode += 1;
      } else {
        warn('Insufficient or wrong predicates to determine only one [to] entity');
      }
      break;
    }

    let fetched: GeneralRelation[] | undefined = undefined;

    switch (i.type) {
      case 'import':
        break;

      case 'inherit':
        break;

      case 'implement':
        break;

      case 'contain':
        break;

      case 'call':
        break;

      case 'parameter':
        break;

      case 'typed':
        break;

      case 'usevar':
        break;

      case 'set':
        break;

      case 'modify':
        break;

      case 'annotate':
        break;

      case 'cast':
        break;

      case 'override':
        break;

      case 'reflect':
        break;
    }
  }

  return result;
};
