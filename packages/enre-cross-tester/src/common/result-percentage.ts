import {MatchResult} from '../matchers/match-result';

export default function ({
                           entity: {
                             fullyCorrect: e0,
                             insufficientProp: e1,
                             wrongType: e2,
                             wrongProp: e3,
                             missing: e4,
                             unexpected: e5
                           }, relation: {fullyCorrect: r0, wrongProp: r1, wrongNode: r2, missing: r3, unexpected: r4}
                         }: MatchResult) {
  return (e0 + e1 + r0) / (e0 + e1 + e2 + e3 + e4 + e5 + r0 + r1 + r2 + r3 + r4);
}
