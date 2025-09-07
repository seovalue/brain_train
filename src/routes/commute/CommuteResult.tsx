import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommuteSession, COMMUTE_GAMES } from '../../stores/commuteSession';
import { ConsoleWindow } from '../../components/ConsoleWindow';
import { useSEO } from '../../lib/seo/useSEO';

export const CommuteResult: React.FC = () => {
  const nav = useNavigate();
  useSEO({
    title: '출근길 두뇌훈련 - 결과',
    description: '출근길 두뇌훈련 플레이 결과 요약.',
    robots: 'noindex,follow',
  });
  const { results } = useCommuteSession();

  const isCorrect = (r: (typeof results)[number]): boolean => {
    if (r.id === 'scheduling-lite') {
      const valid = (r.details as any)?.valid;
      if (typeof valid === 'boolean') return valid;
      return (r.score || 0) > 0;
    }
    // 나머지는 점수 양수면 정답으로 간주 (기본 스코어링 10/-5)
    return (r.score || 0) > 0;
  };

  const correctCount = results.reduce((s, r) => s + (isCorrect(r) ? 1 : 0), 0);
  const totalCount = results.length;

  const verdict = (() => {
    if (correctCount === totalCount) return '최고예요!';
    if (correctCount >= Math.max(1, totalCount - 1)) return '아주 좋아요!';
    if (correctCount >= Math.ceil(totalCount / 2)) return '잘하고 있어요!';
    return '다음엔 더 잘할 수 있어요!';
  })();

  return (
    <div className="min-h-screen p-3 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <div className="text-2xl mb-3">🧠</div>
          <div className="text-base font-bold">오늘의 결과</div>
          <div className="font-black text-console-green tracking-wider" style={{ fontSize: 'clamp(2rem, 9vw, 4.5rem)', marginTop: '10px', marginBottom: '6px' }}>
            {correctCount}/{totalCount}
          </div>
          <div className="text-sm" style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.25rem)' }}>{verdict}</div>
        </div>

        {/* 상세 결과 */}
        <ConsoleWindow className="mb-6" style={{ padding: '1.5rem' }}>
          <div className="text-xs">
            <ul className="list-disc pl-5 text-left">
              {results.map((r, i) => {
                const meta = COMMUTE_GAMES.find(g => g.id === r.id);
                const ok = isCorrect(r);
                return (
                  <li key={i} className={ok ? 'text-console-green' : 'text-console-red'}>
                    {meta?.icon} {meta?.title.replace(/\n/g, ' ')} — {ok ? '정답' : '오답'}
                  </li>
                );
              })}
            </ul>
          </div>
        </ConsoleWindow>

        {/* 액션 */}
        <div className="space-y-3">
          <button className="pixel-button w-full" onClick={() => nav('/')}>홈으로</button>
          <div className="text-center text-console-fg/70 text-xs" style={{paddingTop: '10px'}}>오늘도 화이팅!</div>
        </div>
      </div>
    </div>
  );
};
