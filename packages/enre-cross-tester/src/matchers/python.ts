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
      case 'package':
      case 'module':
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
            result.entity.fullyCorrect += 1;
            result.entity.unexpected += fetched.length - 1;
          }
        } else {
          result.entity.missing += 1;
        }
        break;

      case 'variable':
      case 'function':
      case 'parameter':
      case 'class':
      // TODO: Abstract class and abstract method
      // eslint-disable-next-line no-fallthrough
      case 'attribute':
      case 'alias':
      case 'anonymousfunction':
        fetched = e.where({
          type: i.type,
          name: i.name.printableName,
        });

        if (fetched) {
          if (fetched.length === 1) {
            if (i.negative === true) {
              result.entity.unexpected += 1;
            } else {
              if (fetched[0].location?.start.line === i.loc.start.line) {
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
              } else {
                if (i.negative === true) {
                  result.entity.fullyCorrect += 1;
                } else {
                  result.entity.missing += 1;
                }
              }
            }
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
      // name: i.from.isFullName ? undefined : i.from.name,
      // fullname: i.from.isFullName ? i.from.name : undefined,
      name: i.from.name.indexOf('.') === -1 ? i.from.name : i.from.name.substring(i.from.name.lastIndexOf('.') + 1)
    });

    if (eFrom?.length !== 1) {
      warn('Insufficient or wrong predicates to determine only one [from] entity');
      result.relation.wrongNode += 1;
      continue;
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
      // name: i.to.isFullName ? undefined : i.to.name,
      // fullname: i.to.isFullName ? i.to.name : undefined,
      name: i.to.name.indexOf('.') === -1 ? i.to.name : i.to.name.substring(i.to.name.lastIndexOf('.') + 1)
    });

    if (eTo?.length !== 1) {
      warn('Insufficient or wrong predicates to determine only one [to] entity');
      result.relation.wrongNode += 1;
      continue;
    }

    let fetched: GeneralRelation[] | undefined = undefined;

    switch (i.type) {
      case 'define':
      case 'use':
      case 'set':
      case 'import':
      case 'call':
      case 'inherit':
      case 'contain':
      case 'annotate':
      case 'alias':
        fetched = r.where({
          from: eFrom[0],
          type: i.type,
          to: eTo[0],
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
    }
  }

  return result;
};
