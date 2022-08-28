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
            fetched = e.where({
              type: 'depends-aggregation',
              name: i.name.printableName,
              startLine: i.loc.start.line,
            });

            if (fetched) {
              if (fetched.length === 1) {
                if (i.negative === true) {
                  result.entity.unexpected += 1;
                } else {
                  result.entity.wrongType += 1;
                }
              } else {
                if (i.negative === true) {
                  result.entity.fullyCorrect += 1;
                } else {
                  result.entity.missing += 1;
                }
              }
            }
          } else {
            warn('Insufficient predicates to determine only one entity');
          }
        } else {
          result.entity.missing += 1;
        }
        break;

      case 'file':
      case 'class':
      case 'enum':
      case 'annotation':
      case 'annotationmember':
      case 'interface':
      case 'method':
      case 'module':
      case 'record':
      case 'typeparameter':
      case 'variable':
        fetched = e.where({
          type: i.type,
          name: i.name.printableName,
          startLine: i.loc?.start?.line,
        });

        if (fetched) {
          if (fetched.length === 1) {
            if (i.negative === true) {
              result.entity.unexpected += 1;
            } else {
              result.entity.fullyCorrect += 1;
            }
          } else if (fetched.length === 0) {
            fetched = e.where({
              name: i.name.printableName,
              startLine: i.loc?.start?.line,
            });

            if (fetched) {
              if (fetched.length === 1) {
                if (i.negative === true) {
                  result.entity.unexpected += 1;
                } else {
                  result.entity.wrongType += 1;
                }
              } else {
                if (i.negative === true) {
                  result.entity.fullyCorrect += 1;
                } else {
                  result.entity.missing += 1;
                }
              }
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

    let assertionName = i.from.name as string;

    if (!assertionName.includes('.java') && assertionName.lastIndexOf('.') !== -1) {
      assertionName = assertionName.substring(assertionName.lastIndexOf('.') + 1);
    }

    let eFrom = e.where({
      type: i.from.type,
      name: assertionName,
      startLine: i.from.predicates?.loc?.start?.line,
      inFile: i.from.type === 'file' ? undefined : inFile,
    });

    if (eFrom?.length !== 1) {
      if ((eFrom = e.where({type: 'depends-aggregation', name: assertionName}))?.length === 1) {
        // Go on matching
      } else {
        warn('Insufficient or wrong predicates to determine only one [from] entity');
        result.relation.wrongNode += 1;
        continue;
      }
    }

    inFileIndex = i.to.predicates?.loc?.file;
    inFile = undefined;

    if (inFileIndex !== undefined) {
      const path = cs.code[inFileIndex].path;
      const fileName = path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.'));
      inFile = e.where({type: 'file', name: fileName})![0];
    }

    assertionName = i.to.name as string;

    if (!assertionName.includes('.java') && assertionName.lastIndexOf('.') !== -1) {
      assertionName = assertionName.substring(assertionName.lastIndexOf('.') + 1);
    }

    let eTo = e.where({
      type: i.to.type,
      name: assertionName,
      startLine: i.from.predicates?.loc?.start?.line,
      inFile: i.to.type === 'file' ? undefined : inFile,
    });

    if (eTo?.length !== 1) {
      if ((eTo = e.where({type: 'depends-aggregation', name: assertionName}))?.length === 1) {
        // Go on matching
      } else {
        warn('Insufficient or wrong predicates to determine only one [to] entity');
        result.relation.wrongNode += 1;
        continue;
      }
    }

    let fetched: GeneralRelation[] | undefined = undefined;

    switch (i.type) {
      case 'import':
      case 'inherit':
      case 'implement':
      case 'contain':
      case 'call':
      case 'parameter':
      case 'typed':
      case 'usevar':
      case 'set':
      case 'modify':
      case 'annotate':
      case 'cast':
      case 'override':
      case 'reflect':
      case 'define':
        fetched = r.where({
          from: eFrom![0],
          type: i.type,
          to: eTo![0],
          // line: i.loc.start.line,
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
