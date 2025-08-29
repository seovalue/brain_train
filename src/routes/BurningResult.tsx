import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { track } from '@vercel/analytics';
import type { GameResult } from '../types';

export const BurningResult: React.FC = () => {
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

  // 게임 완료 이벤트 추적
  useEffect(() => {
    if (result) {
      track('burning_game_completed', {
        gameType: 'rps-burning',
        score: score,
        totalQuestions: result.total,
        correctAnswers: result.correct,
        timeSpent: result.ms ? Math.floor(result.ms / 1000) : 0,
      });
    }
  }, [result, score]);

  const getBurningScoreMessage = (score: number) => {
    if (score === 100) return "🔥🔥🔥 불사조의 재탄생! 🔥🔥🔥";
    if (score >= 90) return "🔥🔥 화염의 지배자! 🔥🔥";
    if (score >= 80) return "🔥 불꽃의 전사! 🔥";
    if (score >= 70) return "🔥 열정의 불꽃! 🔥";
    if (score >= 50) return "🔥 불꽃이 타오르고 있어요! 🔥";
    return "🔥 조금만 더 노력하면 초고수! 🔥";
  };

  const getBurningScoreColor = (score: number) => {
    if (score === 100) return "text-[#FF0000]"; // 빨간색
    if (score >= 90) return "text-[#FF4400]"; // 주황빨강
    if (score >= 80) return "text-[#FF6600]"; // 주황색
    if (score >= 70) return "text-[#FF8800]"; // 밝은 주황
    if (score >= 50) return "text-[#FFAA00]"; // 노란 주황
    return "text-[#FFCC00]"; // 노란색
  };

  const getBurningBackground = (score: number) => {
    if (score === 100) return "bg-gradient-to-b from-[#1A0000] to-[#2A0000]";
    if (score >= 90) return "bg-gradient-to-b from-[#1A0A00] to-[#2A0A00]";
    if (score >= 80) return "bg-gradient-to-b from-[#1A1500] to-[#2A1500]";
    if (score >= 70) return "bg-gradient-to-b from-[#1A2000] to-[#2A2000]";
    if (score >= 50) return "bg-gradient-to-b from-[#1A2A00] to-[#2A2A00]";
    return "bg-gradient-to-b from-[#1A3500] to-[#2A3500]";
  };

  const getBurningBorder = (score: number) => {
    if (score === 100) return "border-[#FF0000]";
    if (score >= 90) return "border-[#FF4400]";
    if (score >= 80) return "border-[#FF6600]";
    if (score >= 70) return "border-[#FF8800]";
    if (score >= 50) return "border-[#FFAA00]";
    return "border-[#FFCC00]";
  };

  const getBurningAnimation = (score: number) => {
    if (score >= 80) return "animate-pulse";
    return "";
  };

  return (
    <div className={`min-h-screen ${getBurningBackground(score)}`}>
      <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6">
        <div className="w-full max-w-md">
          {/* 🔥 BURNING MODE 헤더 */}
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <div className="text-[#FF5555] font-bold text-lg sm:text-xl md:text-2xl mb-4 tracking-wider">
              🔥 BURNING MODE 🔥
            </div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 md:mb-4">
              초고난이도 결과
            </h1>
            <div 
              className={`font-black mb-3 sm:mb-4 md:mb-6 tracking-wider drop-shadow-lg ${getBurningScoreColor(score)} ${getBurningAnimation(score)}`}
              style={{ 
                fontSize: 'clamp(2rem, 8vw, 4rem)',
                fontWeight: '900',
                textShadow: score >= 80 ? '0 0 20px rgba(255, 85, 85, 0.8)' : 'none'
              }}
            >
              {score}점
            </div>
            <p className="text-sm sm:text-base md:text-lg text-[#FF5555] font-bold">
              {getBurningScoreMessage(score)}
            </p>
          </div>

          {/* 상세 결과 */}
          <div className={`console-window mb-6 sm:mb-8 md:mb-12 border-2 ${getBurningBorder(score)} bg-[#2A1A1A]`} style={{ padding: '2rem' }}>
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              <div className="flex justify-between items-center text-xs sm:text-sm md:text-base">
                <span className="text-[#E0E0E0]">맞춘 개수:</span>
                <span className="font-bold text-[#FF5555]">
                  {result.correct}/{result.total}
                </span>
              </div>
              
              {result.ms && (
                <div className="flex justify-between items-center text-xs sm:text-sm md:text-base">
                  <span className="text-[#E0E0E0]">소요 시간:</span>
                  <span className="font-bold text-[#FF5555]">
                    {minutes}분 {seconds}초
                  </span>
                </div>
              )}

              {/* 특별한 통계 */}
              <div className="flex justify-between items-center text-xs sm:text-sm md:text-base">
                <span className="text-[#E0E0E0]">평균 반응시간:</span>
                <span className="font-bold text-[#FF5555]">
                  {timeInSeconds > 0 ? (timeInSeconds / result.total).toFixed(1) : '0'}초
                </span>
              </div>
            </div>
          </div>

          {/* 특별한 메시지 */}
          {score >= 80 && (
            <div className={`console-window mb-6 border-2 ${getBurningBorder(score)} bg-[#3A2A2A]`} style={{ padding: '1.5rem' }}>
              <div className="text-center">
                <div className="text-[#FF5555] font-bold text-sm sm:text-base mb-2">
                  🏆 불사조 등급 달성! 🏆
                </div>
                <div className="text-[#E0E0E0] text-xs sm:text-sm">
                  {score === 100 
                    ? "완벽한 불꽃의 지배자! 당신은 진정한 마스터입니다!"
                    : score >= 90
                    ? "화염의 전사! 거의 완벽한 실력을 보여주셨네요!"
                    : "불꽃의 기사! 정말 대단한 실력입니다!"
                  }
                </div>
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            <button
              className="pixel-button w-full text-xs sm:text-sm md:text-base py-3 sm:py-4 border-2 border-[#FF5555] bg-[#3A2A2A] hover:bg-[#4A3A3A]"
              onClick={() => {
                const shareText = `🔥 고수로 인정받아 BURNING MODE에서 ${score}점을 획득했습니다!\n${result.correct}/${result.total} 문제를 맞췄어요.\n초고난이도 도전에 성공했어요!🔥\n\n당신도 도전해보세요!\nhttps://alwaysdo.xyz/`;
                navigator.clipboard.writeText(shareText);
                alert('공유 텍스트가 클립보드에 복사되었습니다!');
              }}
            >
              🔥 내 불꽃 자랑하기 🔥
            </button>
            
            <button
              className="pixel-button w-full text-xs sm:text-sm md:text-base py-3 sm:py-4 md:py-5"
              onClick={() => navigate('/')}
            >
              홈으로
            </button>
          </div>

          {/* 특별한 푸터 메시지 */}
          <div className="mt-6 sm:mt-8 md:mt-10 text-center">
            <p className="text-xs sm:text-sm text-[#FF5555]/70">
              🔥 BURNING 🔥
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
