import React, { useMemo, useState } from 'react';
import { ConsoleWindow } from '../../ConsoleWindow';
import { genDeployCountdown } from '../../../lib/commute/games';
import { baseScore } from '../../../lib/commute/scoring';

interface Props {
  onSubmit: (score: number, details?: Record<string, unknown>, reactionMs?: number) => void;
}

export const DeployCountdown: React.FC<Props> = ({ onSubmit }) => {
  const problem = useMemo(() => genDeployCountdown('v1'), []);
  const [days, setDays] = useState('');
  const [due, setDue] = useState('');
  const [startedAt] = useState<number>(Date.now());

  const daysNum = Number(days);
  const daysOk = !Number.isNaN(daysNum) && daysNum === problem.daysLeft;
  const dueOk = due.trim() === problem.engineerDue;
  const allOk = daysOk && dueOk;

  const handleSubmit = () => {
    const score = baseScore(allOk);
    const reactionMs = Date.now() - startedAt;
    onSubmit(score, {
      userDays: daysNum, answerDays: problem.daysLeft,
      userDue: due, answerDue: problem.engineerDue,
    }, reactionMs);
  };

  return (
    <div className="w-full max-w-[320px]">
      <ConsoleWindow className="mb-3" style={{ padding: '10px' }}>
        <div className="text-xs">
          <div>프로젝트: {problem.project}</div>
          <div>배포일: {problem.release}</div>
          <div>오늘: {problem.today}</div>
          <div className="mt-2 text-console-fg/70">지시사항: 주말 무관 일수 기준 계산. QA는 릴리즈 당일까지 포함. 엔지니어 마감일은 QA 시작일.</div>
        </div>
      </ConsoleWindow>
      <div className="console-window mb-3" style={{ padding: '10px' }}>
        <div className="mb-2 text-sm">남은 일수?</div>
        <input className="number-input w-full" inputMode="numeric" placeholder="예) 26" value={days} onChange={(e)=>setDays(e.target.value.replace(/[^0-9]/g,''))} />
        <div className="mt-2 text-xs flex justify-center">
          {days.length>0 && (daysOk ?
            <span className="feedback-badge feedback-correct">정확합니다 ✅</span> :
            <span className="feedback-badge feedback-wrong">오답이에요 ❌</span>
          )}
        </div>
      </div>
      <div className="console-window mb-3" style={{ padding: '10px' }}>
        <div className="mb-2 text-sm">QA {problem.qaDays}일 소요면, 엔지니어 마감일?</div>
        <input className="number-input w-full" placeholder="YYYY-MM-DD" value={due} onChange={(e)=>setDue(e.target.value.replace(/[^0-9-]/g,''))} />
        <div className="mt-2 text-xs flex justify-center">
          {due.length>0 && (dueOk ?
            <span className="feedback-badge feedback-correct">정확합니다 ✅</span> :
            <span className="feedback-badge feedback-wrong">오답이에요 ❌</span>
          )}
        </div>
      </div>
      <button className="pixel-button w-full" onClick={handleSubmit} disabled={!days.length || !due.length}>제출</button>
    </div>
  );
};
