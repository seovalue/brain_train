import React, { useMemo, useState } from 'react';
import { ConsoleWindow } from '../../ConsoleWindow';
import { genMeetingSum } from '../../../lib/commute/games';
import { baseScore } from '../../../lib/commute/scoring';

interface Props {
  onSubmit: (score: number, details?: Record<string, unknown>, reactionMs?: number) => void;
}

export const MeetingSum: React.FC<Props> = ({ onSubmit }) => {
  const problem = useMemo(() => genMeetingSum('v1'), []);
  const [total, setTotal] = useState('');
  const [longest, setLongest] = useState<number | null>(null);
  const [startedAt] = useState<number>(Date.now());

  const totalNum = Number(total);
  const totalCorrect = !Number.isNaN(totalNum) && totalNum === problem.totalMinutes;
  const longestCorrect = longest === problem.longestIndex;

  const handleSubmit = () => {
    const correctBoth = totalCorrect && longestCorrect;
    const score = baseScore(correctBoth);
    const reactionMs = Date.now() - startedAt;
    onSubmit(score, {
      userTotal: totalNum,
      answerTotal: problem.totalMinutes,
      userLongest: longest,
      answerLongest: problem.longestIndex,
    }, reactionMs);
  };

  return (
    <div className="w-full">
      <ConsoleWindow className="mb-3" style={{ padding: '10px' }}>
        <div className="text-xs mb-2">
          <div className="mb-2 text-console-fg/80 text-center" style={{paddingBottom: '10px'}}>미팅 소요시간은 총 몇 분인가요?</div>
          {problem.meetings.map((m, i) => (
            <div key={i} className="flex justify-between items-center py-1">
              <div className="truncate" style={{maxWidth:'55%',fontSize: '15px'}}>{i+1}) {m.title}</div>
              <div className="text-console-fg/70" style={{fontSize: '12px'}}>{m.start}–{m.end}</div>
            </div>
          ))}
        </div>
      </ConsoleWindow>
      <div className="console-window mb-3" style={{ padding: '10px' }}>
        <div className="mb-2 text-sm">총 소요시간(분)</div>
        <input
          className="number-input w-full"
          inputMode="numeric"
          placeholder="예) 240"
          value={total}
          onChange={(e) => setTotal(e.target.value.replace(/[^0-9]/g, ''))}
        />
        <div className="mt-2 text-xs">
          {total.length > 0 && (totalCorrect ?
            <span className="feedback-badge feedback-correct">굿! 합산 정확해요 👍</span> :
            <span className="feedback-badge feedback-wrong">아쉬워요. 계속 시도해보세요!</span>
          )}
        </div>
      </div>
      <div className="console-window mb-3" style={{ padding: '10px' }}>
        <div className="mb-2 text-sm">가장 긴 미팅은 무엇인가요?</div>
        <div className="grid grid-cols-3 gap-2">
          {problem.meetings.map((_, i) => (
            <button
              key={i}
              className={`pixel-button text-[10px] py-2 ${longest===i?'border-console-green':''}`}
              onClick={() => setLongest(i)}
              style={{fontSize: '15px'}}
            >{i+1}번</button>
          ))}
        </div>
        <div className="mt-2 text-xs">
          {longest !== null && (longestCorrect ?
            <span className="feedback-badge feedback-correct">정답 체크 ✅</span> :
            <span className="feedback-badge feedback-wrong">오답이에요 ❌</span>
          )}
        </div>
      </div>
      <button
        className="pixel-button w-full"
        onClick={handleSubmit}
        disabled={!total.length || longest === null}
      >제출</button>
    </div>
  );
};
