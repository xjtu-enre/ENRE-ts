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

      case 'variable':
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

      case 'function': {
        let predicateName = i.name.printableName;

        if (i.name.payload?.as === 'ArrowFunction') {
          predicateName = '<Anonymous as="Function">';
        }

        fetched = e.where({
          type: i.type,
          name: predicateName,
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
      }

      case 'parameter':
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
            fetched = e.where({
              type: 'variable',
              name: i.name.printableName,
              startLine: i.loc.start.line,
            });

            if (fetched) {
              if (fetched.length === 1) {
                result.entity.wrongType += 1;
              } else if (fetched.length === 0) {
                if (i.negative === true) {
                  result.entity.fullyCorrect += 1;
                } else {
                  result.entity.missing += 1;
                }
              }
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

      case 'class':
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

      case 'field':
        fetched = e.where({
          type: i.type,
          name: i.name.printableName,
        });

        if (fetched) {
          if (fetched.length === 1) {
            if (i.static !== undefined && i.static === fetched[0].static) {
              if (i.negative === true) {
                result.entity.unexpected += 1;
                break;
              }
            } else if (i.static === undefined) {
              // ignore
            } else {
              result.entity.wrongProp += 1;
              break;
            }

            if (i.private !== undefined && i.private === fetched[0].private) {
              if (i.negative === true) {
                result.entity.unexpected += 1;
                break;
              }
            } else if (i.private === undefined) {
              // ignore
            } else {
              if (fetched[0].private === undefined) {
                result.entity.insufficientProp += 1;
              } else {
                result.entity.wrongProp += 1;
              }
              break;
            }

            if (i.TSModifier !== undefined && i.TSModifier === fetched[0].TSModifier) {
              if (i.negative === true) {
                result.entity.unexpected += 1;
              } else {
                result.entity.fullyCorrect += 1;
              }
            } else if (i.TSModifier === undefined) {
              if (i.negative === true) {
                result.entity.unexpected += 1;
              } else {
                result.entity.fullyCorrect += 1;
              }
            } else {
              if (fetched[0].TSModifier === undefined) {
                result.entity.insufficientProp += 1;
              } else {
                result.entity.wrongProp += 1;
              }
              break;
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

      case 'method':
        fetched = e.where({
          type: i.type,
          name: i.name.printableName,
          startLine: i.loc.start.line,
        });

        if (fetched) {
          if (fetched.length === 1) {
            if (i.static !== undefined && i.static === fetched[0].static) {
              if (i.negative === true) {
                result.entity.unexpected += 1;
                break;
              }
            } else if (i.static === undefined) {
              // ignore
            } else {
              result.entity.wrongProp += 1;
              break;
            }

            if (i.private !== undefined && i.private === fetched[0].private) {
              if (i.negative === true) {
                result.entity.unexpected += 1;
                break;
              }
            } else if (i.private === undefined) {
              // ignore
            } else {
              if (fetched[0].private === undefined) {
                result.entity.insufficientProp += 1;
              } else {
                result.entity.wrongProp += 1;
              }
              break;
            }

            if (i.TSModifier !== undefined && i.TSModifier === fetched[0].TSModifier) {
              if (i.negative === true) {
                result.entity.unexpected += 1;
              } else {
                result.entity.fullyCorrect += 1;
              }
            } else if (i.TSModifier === undefined) {
              if (i.negative === true) {
                result.entity.unexpected += 1;
              } else {
                result.entity.fullyCorrect += 1;
              }
            } else {
              if (fetched[0].TSModifier === undefined) {
                result.entity.insufficientProp += 1;
              } else {
                result.entity.wrongProp += 1;
              }
              break;
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

      case 'property':
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
            fetched = e.where({
              type: 'method',
              name: i.name.printableName,
              startLine: i.loc.start.line,
            });

            if (fetched) {
              if (fetched.length === 1) {
                result.entity.wrongType += 1;
              } else if (fetched.length === 0) {
                if (i.negative === true) {
                  result.entity.fullyCorrect += 1;
                } else {
                  result.entity.missing += 1;
                }
              }
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
            // Declaration merging
            result.entity.unexpected += fetched.length - 1;
          }
        } else {
          result.entity.missing += 1;
        }
        break;

      case 'type alias':
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

      case 'enum':
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
            // Declaration merging
            result.entity.unexpected += fetched.length - 1;
          }
        } else {
          result.entity.missing += 1;
        }
        break;

      case 'enum member':
        fetched = e.where({
          type: 'property',
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

      case 'interface':
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
            // Declaration merging
            result.entity.unexpected += fetched.length - 1;
          }
        } else {
          result.entity.missing += 1;
        }
        break;

      case 'type parameter':
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
      case 'export':
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
              if (i.alias) {
                if (i.alias === fetched[0].alias) {
                  result.relation.fullyCorrect += 1;
                } else {
                  result.relation.wrongProp += 1;
                }
              } else {
                result.relation.fullyCorrect += 1;
              }
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
      case 'use':
      case 'modify':
      case 'extend':
      case 'override':
      case 'type':
      case 'implement':
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

      case 'set':
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
              if (i.init) {
                if (i.init === fetched[0].init) {
                  result.relation.fullyCorrect += 1;
                } else {
                  result.relation.wrongProp += 1;
                }
              } else {
                result.relation.fullyCorrect += 1;
              }
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
