import {CaseContainer} from '@enre/doc-parser';
import {createMatchResultContainer, MatchResult} from './match-result';
import {e, r} from '../slim-container';
import {GeneralEntity} from '../slim-container/e';
import {info, warn} from '@enre/logging';

const listOfEntityWithNoLocation = ['package', 'file', 'module'];
const listOfRelationWithNoLocation = ['contain'];

info('Using the new universal matcher');

export default (cs: CaseContainer, lang: 'cpp' | 'java' | 'python' | 'ts'): MatchResult => {
  const result = createMatchResultContainer();

  /**
   * Entity matching
   */
  let noExtraOn = cs.assertion.entity?.extra === false ? cs.assertion.entity.type.toLowerCase() : undefined;
  let extraMask: number[] | undefined;
  if (noExtraOn) {
    extraMask = e.all.filter(ent => ent.type === noExtraOn).map(ent => ent.id);
  }

  for (const i of cs.assertion.entity?.items || []) {
    let name = i.name.printableName;
    if (lang === 'cpp') {
      if (name.lastIndexOf('::') !== -1) {
        name = name.substring(name.lastIndexOf('::') + 2);
      }
    }

    const searchingPolicy = {
      assertion: {
        type: i.type,
        name,
        fullname: i.qualified,
        startLine: listOfEntityWithNoLocation.indexOf(i.type) === -1 ? i.loc?.start?.line : undefined,
        startColumn: listOfEntityWithNoLocation.indexOf(i.type) === -1 ? i.loc?.start?.column : undefined,
      },
      rounds: [
        {predicates: ['name', 'type', 'startLine', 'startColumn'], level: 'fullyCorrect'},
        {predicates: ['name', 'type', 'startLine'], level: 'wrongProp'},
        {predicates: ['name', 'type'], level: 'wrongProp'},
        {predicates: ['name'], level: 'wrongType'},
      ]
    };

    for (const [index, round] of searchingPolicy.rounds.entries()) {
      const predicateObj = {};
      for (const predicateProp of round.predicates) {
        // @ts-ignore
        predicateObj[predicateProp] = searchingPolicy.assertion[predicateProp];
      }

      const fetched = e.where(predicateObj);

      if (fetched.length === 1) {
        if (i.negative === true) {
          result.entity.unexpected += 1;
        } else {
          // @ts-ignore
          result.entity[round.level] += 1;
        }
        if (extraMask && noExtraOn === i.type) {
          extraMask = extraMask.filter(id => id !== fetched[0].id);
        }
      } else if (fetched.length === 0) {
        if (index === searchingPolicy.rounds.length - 1) {
          if (i.negative === true) {
            result.entity.fullyCorrect += 1;
          } else {
            result.entity.missing += 1;
          }
        } else {
          continue;
        }
      } else {
        if (searchingPolicy.assertion.fullname !== undefined) {
          let resolved = false;
          for (const candidate of fetched) {
            if (candidate.fullname === searchingPolicy.assertion.fullname) {
              if (i.negative === true) {
                result.entity.unexpected += 1;
              } else {
                // @ts-ignore
                result.entity[round.level] += 1;
              }
              resolved = true;
              if (extraMask && noExtraOn === i.type) {
                extraMask = extraMask.filter(id => id !== candidate.id);
              }
              break;
            }
          }
          if (!resolved) {
            if (i.negative === true) {
              result.entity.unexpected += 1;
            } else {
              // @ts-ignore
              result.entity[round.level] += 1;
            }
            warn('QualifiedName is also insufficient to determine only one entity');
            debugger;
          }
        } else {
          if (i.negative === true) {
            result.entity.unexpected += 1;
          } else {
            // @ts-ignore
            result.entity[round.level] += 1;
          }
          warn('Insufficient predicates to determine only one entity');
          debugger;
        }
      }

      break;
    }
  }

  if (extraMask) {
    result.entity.unexpected += extraMask.length;
  }

  /**
   * Relation matching
   */
  noExtraOn = cs.assertion.relation?.extra === false ? cs.assertion.relation.type.toLowerCase() : undefined;
  if (noExtraOn) {
    extraMask = r.all.filter(rel => rel.type === noExtraOn).map(rel => rel.id) as number[];
  } else {
    extraMask = undefined;
  }

  nextRelation: for (const i of cs.assertion.relation?.items || []) {
    const E = {fromE: undefined, toE: undefined};

    for (const role of ['from', 'to']) {
      let inFileIndex = i[role].predicates?.loc?.file;
      let inFile: GeneralEntity | undefined = undefined;

      if (inFileIndex !== undefined) {
        const path = cs.code[inFileIndex].path;
        const fileName = path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.'));
        inFile = e.where({type: 'file', name: fileName})[0];
      }

      let assertionName: string | undefined = i[role].name as string;
      let fullname = undefined;

      if (lang === 'cpp') {
        if (!(assertionName.includes('.cpp') || assertionName.includes('.h')) && assertionName.lastIndexOf('.') !== -1) {
          assertionName = assertionName.substring(assertionName.lastIndexOf('.') + 1);
        }
        if (assertionName.lastIndexOf('::') !== -1) {
          assertionName = assertionName.substring(assertionName.lastIndexOf('::') + 2);
        }
      } else if (lang === 'java') {
        if (!assertionName.includes('.java') && assertionName.lastIndexOf('.') !== -1) {
          fullname = assertionName;
          assertionName = undefined;
        }
      } else if (lang === 'python') {
        if (i[role].isFullName) {
          assertionName = assertionName.substring(assertionName.lastIndexOf('.') + 1);
        }
      }

      // @ts-ignore
      E[`${role}E`] = e.where({
        type: i[role].type,
        name: assertionName,
        fullname,
        startLine: i[role].predicates?.loc?.start?.line,
        inFile: listOfEntityWithNoLocation.indexOf(i[role].type) > 0 ? undefined : inFile,
      });

      // @ts-ignore
      if (E[`${role}E`].length !== 1) {
        // @ts-ignore
        if ((E[`${role}E`] = e.where({name: assertionName, fullname}))?.length === 1) {
          // Go on matching
        } else {
          warn(`Insufficient or wrong predicates to determine only one [${role}] entity`);
          result.relation.wrongNode += 1;
          continue nextRelation;
        }
      }
    }

    const searchingPolicy = {
      assertion: {
        from: E.fromE![0],
        to: E.toE![0],
        type: i.type,
        line: listOfRelationWithNoLocation.indexOf(i.type) === -1 ? i.loc.start.line : undefined,
        column: listOfRelationWithNoLocation.indexOf(i.type) === -1 ? i.loc.start.column : undefined,
      },
      rounds: [
        {predicates: ['from', 'to', 'type', 'line', 'column'], level: 'fullyCorrect'},
        {predicates: ['from', 'to', 'type', 'line'], level: 'wrongProp'},
        {predicates: ['from', 'to', 'type'], level: 'wrongProp'},
        {predicates: ['from', 'to'], level: 'wrongType'},
      ]
    };

    for (const [index, round] of searchingPolicy.rounds.entries()) {
      const predicateObj = {};
      for (const predicateProp of round.predicates) {
        // @ts-ignore
        predicateObj[predicateProp] = searchingPolicy.assertion[predicateProp];
      }

      const fetched = r.where(predicateObj);

      if (fetched.length === 1) {
        if (i.negative === true) {
          result.relation.unexpected += 1;
        } else {
          // @ts-ignore
          result.relation[round.level] += 1;
        }
        if (extraMask && noExtraOn === i.type) {
          extraMask = extraMask.filter(id => id !== fetched[0].id);
        }
      } else if (fetched.length === 0) {
        if (index === searchingPolicy.rounds.length - 1) {
          if (i.negative === true) {
            result.relation.fullyCorrect += 1;
          } else {
            result.relation.missing += 1;
          }
        } else {
          continue;
        }
      } else {
        if (i.negative === true) {
          result.relation.unexpected += 1;
        } else {
          // @ts-ignore
          result.relation[round.level] += 1;
        }
        warn('Insufficient predicates to determine only one dependency');
        debugger;
      }

      break;
    }
  }

  if (extraMask) {
    result.relation.unexpected += extraMask.length;
  }

  return result;
};
