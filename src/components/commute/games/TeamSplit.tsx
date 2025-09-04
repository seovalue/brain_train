import React, { useMemo, useState } from 'react';
import { ConsoleWindow } from '../../ConsoleWindow';
import { genTeamSplit } from '../../../lib/commute/games';
import { baseScore } from '../../../lib/commute/scoring';

interface Props {
  onSubmit: (score: number, details?: Record<string, unknown>, reactionMs?: number) => void;
}

export const TeamSplit: React.FC<Props> = ({ onSubmit }) => {
  const problem = useMemo(() => genTeamSplit('v1'), []);
  const [answerTotal, setAnswerTotal] = useState('');
  const [answerPer, setAnswerPer] = useState('');
  const [startedAt] = useState<number>(Date.now());

  const total = problem.lines.reduce((s, l) => s + l.qty * l.unit, 0);
  const userTotal = Number(answerTotal);
  const userPer = Number(answerPer);
  const correctTotal = !Number.isNaN(userTotal) && userTotal === total;
  const correctPer = !Number.isNaN(userPer) && userPer === problem.perPerson;
  const allCorrect = correctTotal && correctPer;

  const handleSubmit = () => {
    const score = baseScore(allCorrect);
    const reactionMs = Date.now() - startedAt;
    onSubmit(score, {
      userTotal,
      answerTotal: total,
      userPer,
      answerPer: problem.perPerson,
      members: problem.members,
      extraLeader: problem.extraLeader,
    }, reactionMs);
  };

  return (
    <div className="w-full">
        <ConsoleWindow className="mb-3" style={{ padding: '10px' }}>
          <div className="text-xs">
            <div className="mb-2 text-console-fg/80 text-center" style={{paddingBottom: '10px'}}>
              <div>팀 회식 정산(1원 반올림)</div>
              <div>총액과 1인당 금액을 계산하세요.</div>
            </div>
            <div className="mb-2">팀원 {problem.members}명</div>
            <ul className="list-disc list-inside pl-5 mb-3">
              {problem.lines.map((l,i) => (
                <li key={i}>{l.name} {l.qty} × {l.unit.toLocaleString()}원</li>
              ))}
            </ul>
            <div className="mb-1">리더가 {problem.extraLeader.toLocaleString()}원 더 부담</div>
            <div className="text-console-fg/70">라운딩 규칙: 1원 반올림</div>
          </div>
        </ConsoleWindow>

        <div className="console-window mb-4 mt-5" style={{ padding: '10px' }}>
          <div className="mb-3 text-sm">총액은?</div>
          <div>
          <input
            className="number-input w-full"
            inputMode="numeric"
            placeholder="예) 27000"
            value={answerTotal}
            onChange={(e) => setAnswerTotal(e.target.value.replace(/[^0-9]/g, ''))}
          />
          <div className="mt-2 text-xs flex justify-center">
            {answerTotal.length>0 && (correctTotal ?
              <span className="feedback-badge feedback-correct">정확해요 ✅</span> :
              <span className="feedback-badge feedback-wrong">다시 계산해보세요 ❌</span>
            )}
          </div>
          </div>
        </div>

        <div className="console-window mb-4" style={{ padding: '10px' }}>
          <div className="mb-3 text-sm">나머지 1인당 금액은?</div>
          <div>
          <input
            className="number-input w-full"
            inputMode="numeric"
            placeholder="예) 3200"
            value={answerPer}
            onChange={(e) => setAnswerPer(e.target.value.replace(/[^0-9]/g, ''))}
          />
          <div className="mt-2 text-xs flex justify-center">
            {answerPer.length>0 && (correctPer ?
              <span className="feedback-badge feedback-correct">맞아요! 정확해요 ✅</span> :
              <span className="feedback-badge feedback-wrong">다시 계산해보세요 ❌</span>
            )}
          </div>
          </div>
        </div>

        <button className="pixel-button w-full" onClick={handleSubmit} disabled={!answerTotal.length || !answerPer.length}>제출</button>
    </div>
  );
};
