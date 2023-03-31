import {MatchResult} from '../matchers/match-result';

export default function ({
  entity: {
    fullyCorrect: e0,
    insufficientProp: e1,
    wrongType: e2,
    wrongProp: e3,
    missing: e4,
    unexpected: e5
  }, relation: {fullyCorrect: r0, wrongType: r1, wrongProp: r2, wrongNode: r3, missing: r4, unexpected: r5}
}: MatchResult) {
  return (e0 + e1 + e2 + e3 + r0 + r1 + r2) / (e0 + e1 + e2 + e3 + e4 + e5 + r0 + r1 + r2 + r3 + r4 + r5);
}
