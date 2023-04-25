import {MatchResult} from '../matchers/match-result';

export default function (operand0: MatchResult, operand1: MatchResult) {
  operand0.entity.insufficientProp += operand1.entity.insufficientProp;
  operand0.entity.fullyCorrect += operand1.entity.fullyCorrect;
  operand0.entity.wrongType += operand1.entity.wrongType;
  operand0.entity.wrongProp += operand1.entity.wrongProp;
  operand0.entity.missing += operand1.entity.missing;
  operand0.entity.unexpected += operand1.entity.unexpected;

  operand0.relation.fullyCorrect += operand1.relation.fullyCorrect;
  operand0.relation.wrongType += operand1.relation.wrongType;
  operand0.relation.wrongNode += operand1.relation.wrongNode;
  operand0.relation.wrongProp += operand1.relation.wrongProp;
  operand0.relation.missing += operand1.relation.missing;
  operand0.relation.unexpected += operand1.relation.unexpected;
}
