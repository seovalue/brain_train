import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ConsoleWindow } from '../components/ConsoleWindow';
import { getStreak } from '../stores/dailyQuiz';
import type { GameResult } from '../types';

export const Result: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result as GameResult;
  const streak = getStreak();

  if (!result) {
    navigate('/');
    return null;
  }

  const accuracy = Math.round((result.correct / result.total) * 100);
  const timeInSeconds = result.ms ? Math.floor(result.ms / 1000) : 0;
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;

  const getScoreMessage = (score: number) => {
    if (score >= 9) return "🎉 완벽합니다!";
    if (score >= 7) return "👍 잘했어요!";
    if (score >= 5) return "😊 괜찮아요!";
    return "💪 다음엔 더 잘할 수 있어요!";
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6">
      {/* 결과 헤더 */}
      <div className="text-center mb-6 sm:mb-8 md:mb-12">
        <div className="text-3xl sm:text-4xl md:text-6xl mb-3 sm:mb-4 md:mb-6">🎉</div>
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 md:mb-4">오늘의 점수</h1>
        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-console-green mb-3 sm:mb-4 md:mb-6">
          {result.correct}/{result.total}점
        </div>
        <p className="text-sm sm:text-base md:text-lg">{getScoreMessage(result.correct)}</p>
      </div>

      {/* 상세 결과 */}
      <ConsoleWindow className="mb-6 sm:mb-8 md:mb-12">
        <div className="space-y-3 sm:space-y-4 md:space-y-6 p-3 sm:p-4 md:p-6">
          <div className="flex justify-between text-xs sm:text-sm md:text-base">
            <span>정답률:</span>
            <span className="font-bold">{accuracy}%</span>
          </div>
          
          {result.ms && (
            <div className="flex justify-between text-xs sm:text-sm md:text-base">
              <span>소요시간:</span>
              <span className="font-bold">
                {minutes}분 {seconds}초
              </span>
            </div>
          )}
          
          <div className="flex justify-between text-xs sm:text-sm md:text-base">
            <span>연속기록:</span>
            <span className="font-bold text-console-blue">
              {streak}일째!
            </span>
          </div>
        </div>
      </ConsoleWindow>

      {/* 액션 버튼 */}
      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        <button
          className="pixel-button w-full text-xs sm:text-sm md:text-base py-3 sm:py-4 md:py-5"
          onClick={() => {
            // 퀴즈 재시작
            navigate('/');
          }}
        >
          다시 풀기
        </button>
        
        <button
          className="pixel-button w-full text-xs sm:text-sm md:text-base py-3 sm:py-4 md:py-5"
          onClick={() => navigate('/')}
        >
          홈으로
        </button>
      </div>
    </div>
  );
};
