import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommuteSession } from '../../stores/commuteSession';
import { MeetingSum } from '../../components/commute/games/MeetingSum';
import { TeamSplit } from '../../components/commute/games/TeamSplit';
import { DeployCountdown } from '../../components/commute/games/DeployCountdown';
import { SchedulingLite } from '../../components/commute/games/SchedulingLite';
import { PrioritizationLite } from '../../components/commute/games/PrioritizationLite';

export const CommutePlay: React.FC = () => {
  const nav = useNavigate();
  const { selected, currentIndex, submitGameResult, nextGame, startAutoSession } = useCommuteSession();
  const id = selected[currentIndex];

  // 직접 진입 시 자동 시작 보정
  useEffect(() => {
    if (!selected || selected.length === 0) {
      startAutoSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!id) {
    // 선택이 없거나 끝난 경우
    nav('/commute/result');
    return null;
  }

  const Progress = () => (
    <div className="mb-2 text-xs">문제 {currentIndex + 1}/{selected.length}</div>
  );

  const onSubmit = (score: number, details?: Record<string, unknown>, reactionMs?: number) => {
    submitGameResult({ id, score, details, reactionTimes: reactionMs ? [reactionMs] : [] });
    nextGame();
    setTimeout(() => {
      if (currentIndex + 1 >= selected.length) nav('/commute/result');
    }, 0);
  };

  return (
    <div className="min-h-screen p-3 flex flex-col">
      {/* 본문: 남은 영역을 차지하며 중앙 정렬 */}
      <div className="px-5 flex-1 flex items-center justify-center">
        <div className="w-full max-w-[320px]">
          <button className="pixel-button mb-2" onClick={()=>nav('/')}>← 홈으로</button>
          <div className="ml-1 mb-2">
            <Progress />
          </div>
          {id === 'meeting-sum' && <MeetingSum onSubmit={onSubmit} />}
          {id === 'team-split' && <TeamSplit onSubmit={onSubmit} />}
          {id === 'deploy-countdown' && <DeployCountdown onSubmit={onSubmit} />}
          {id === 'scheduling-lite' && <SchedulingLite onSubmit={onSubmit} />}
          {id === 'prioritization-lite' && <PrioritizationLite onSubmit={onSubmit} />}
        </div>
      </div>
    </div>
  );
};
