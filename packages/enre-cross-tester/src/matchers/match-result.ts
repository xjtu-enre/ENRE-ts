export interface MatchResult {
  entity: {
    fullyCorrect: number,
    insufficientProp: number,
    wrongType: number,
    wrongProp: number,
    missing: number,
    unexpected: number,
  },
  relation: {
    fullyCorrect: number,
    wrongProp: number,
    wrongNode: number,
    missing: number,
    unexpected: number,
  }
}

export function createMatchResultContainer(): MatchResult {
  return {
    entity: {
      fullyCorrect: 0,
      insufficientProp: 0,
      wrongType: 0,
      wrongProp: 0,
      missing: 0,
      unexpected: 0,
    },
    relation: {
      fullyCorrect: 0,
      wrongProp: 0,
      wrongNode: 0,
      missing: 0,
      unexpected: 0,
    },
  };
}
