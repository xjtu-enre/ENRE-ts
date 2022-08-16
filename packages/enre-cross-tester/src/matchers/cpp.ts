import {CaseContainer} from '@enre/doc-parser';
import {createMatchResultContainer, MatchResult} from './match-result';
import {e, r} from '../slim-container';
import {GeneralEntity} from '../slim-container/e';
import {warn} from '@enre/logging';
import {GeneralRelation} from '../slim-container/r';

export default (cs: CaseContainer): MatchResult => {
  const result = createMatchResultContainer();

  let noExtraOn = cs.assertion.entity?.extra === false ? cs.assertion.entity.type : undefined;

  for (const i of cs.assertion.entity?.items || []) {
    let fetched: GeneralEntity[] | undefined = undefined;

    switch (i.type) {
      case 'file':
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

      case 'namespace':
      case 'alias':
      case 'class':
      case 'struct':
      case 'union':
      case 'macro':
      case 'enum':
      case 'enumerator':
      case 'variable':
      case 'function':
      case 'typedef':
        fetched = e.where({
          type: i.type,
          name: i.name.printableName,
          startLine: i.loc.start.line,
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

      case 'template':
        fetched = e.where({
          type: i.type,
          name: i.name.printableName,
          startLine: i.loc.start.line,
        });

        if (fetched) {
          if (fetched.length === 1) {
            if (i.negative === true) {
              result.entity.unexpected += 1;
            } else {
              if (i.kind === fetched[0].kind) {
                result.entity.fullyCorrect += 1;
              } else {
                result.entity.wrongProp += 1;
              }
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
      case 'alias':
      case 'define':
        fetched = r.where({
          from: eFrom[0],
          type: i.type,
          to: eTo[0],
          line: i.loc.start.line,
        });

        if (fetched) {
          if (fetched.length === 1) {
            if (i.negative) {
              result.relation.unexpected += 1;
            } else {
              result.relation.fullyCorrect += 1;
            }
          } else if (fetched.length === 0) {
            if (i.negative) {
              result.relation.fullyCorrect += 1;
            } else {
              result.relation.missing += 1;
            }
          }
        }
        break;

      case 'call':
        fetched = r.where({
          from: eFrom[0],
          type: i.type,
          to: eTo[0],
          line: i.loc.start.line,
        });

        if (fetched) {
          if (fetched.length === 1) {
            if (i.negative) {
              result.relation.unexpected += 1;
            } else {
              result.relation.fullyCorrect += 1;
            }
          } else if (fetched.length === 0) {
            fetched = r.where({
              type: i.type,
              to: eTo[0],
              line: i.loc.start.line,
            });

            if (fetched && fetched.length !== 0) {
              result.relation.wrongNode += fetched.length;
            }
          }
        }
        break;

      case 'exception':
        break;
      case 'extend':
        break;
      case 'friend':
        break;
      case 'include':
        break;
      case 'modify':
        break;
      case 'override':
        break;
      case 'parameter':
        break;
      case 'set':
        break;
      case 'use':
        break;
      case 'using':
        break;
    }
  }

  return result;
};
