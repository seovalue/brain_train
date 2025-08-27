import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { GameResult } from '../types';

export const Result: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result as GameResult;

  if (!result) {
    navigate('/');
    return null;
  }

  const score = Math.round((result.correct / result.total) * 100);
  const timeInSeconds = result.ms ? Math.floor(result.ms / 1000) : 0;
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;

  const getScoreMessage = (score: number) => {
    if (score >= 90) return "🎉 완벽합니다!";
    if (score >= 70) return "👍 잘했어요!";
    if (score >= 50) return "😊 괜찮아요!";
    return "💪 다음엔 더 잘할 수 있어요!";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-md">
        {/* 결과 헤더 */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 md:mb-4">오늘의 점수</h1>
          <div 
            className="font-black text-console-green mb-3 sm:mb-4 md:mb-6 tracking-wider drop-shadow-lg"
            style={{ 
              fontSize: 'clamp(2rem, 8vw, 4rem)',
              fontWeight: '900'
            }}
          >
            {score}점
          </div>
          <p className="text-sm sm:text-base md:text-lg">{getScoreMessage(score)}</p>
        </div>

        {/* 상세 결과 */}
        <div className="console-window mb-6 sm:mb-8 md:mb-12" style={{ padding: '2rem' }}>
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            <div className="flex justify-between items-center text-xs sm:text-sm md:text-base">
              <span>맞춘 개수:</span>
              <span className="font-bold">{result.correct}/{result.total}</span>
            </div>
            
            {result.ms && (
              <div className="flex justify-between items-center text-xs sm:text-sm md:text-base">
                <span>소요 시간:</span>
                <span className="font-bold">
                  {minutes}분 {seconds}초
                </span>
              </div>
            )}
          </div>
        </div>

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

        {/* 설정 진입점 */}
        <div className="mt-6 sm:mt-8 md:mt-10 text-center">
          <p className="text-xs sm:text-sm text-console-fg/70 mb-3 sm:mb-4">
            더 많은 퀴즈를 풀고 싶다면?
          </p>
          <button
            className="pixel-button px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base"
            onClick={() => navigate('/settings')}
          >
            설정하기
          </button>
        </div>
      </div>
    </div>
  );
};
