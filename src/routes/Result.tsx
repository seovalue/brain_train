import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { track } from '@vercel/analytics';
import type { GameResult } from '../types';
import { useSEO } from '../lib/seo/useSEO';

export const Result: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result as GameResult;

  // SEO: 결과 화면은 검색 가치 낮음 → noindex 권장
  useSEO({
    title: '결과 - 오늘의 점수',
    description: '게임 결과와 점수, 소요 시간 요약 화면.',
    robots: 'noindex,follow',
  });


  if (!result) {
    navigate('/');
    return null;
  }

  const score = Math.round((result.correct / result.total) * 100);
  const timeInSeconds = result.ms ? Math.floor(result.ms / 1000) : 0;
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  
  // 반응속도 게임인지 확인 (gameType이 'reaction'인 경우)
  const isReactionGame = location.state?.gameType === 'reaction';
  
  // 숫자 순서 게임인지 확인 (gameType이 'numberSequence'인 경우)
  const isNumberSequenceGame = location.state?.gameType === 'numberSequence';
  
  // 반응속도/숫자순서 게임의 경우 평균 반응속도 사용
  const averageReactionTime = result.averageReactionTime || 0;

  // 게임 완료 이벤트 추적
  useEffect(() => {
    if (result) {
      track('game_completed', {
        gameType: location.state?.gameType || 'unknown',
        score: (isReactionGame || isNumberSequenceGame) ? averageReactionTime : Math.round((result.correct / result.total) * 100),
        totalQuestions: result.total,
        correctAnswers: result.correct,
        timeSpent: result.ms ? Math.floor(result.ms / 1000) : 0,
      });
    }
  }, [result, location.state?.gameType, isReactionGame, isNumberSequenceGame, averageReactionTime]);

  const getScoreMessage = (score: number) => {
    if (score >= 90) return "🎉 완벽합니다!";
    if (score >= 70) return "👍 잘했어요!";
    if (score >= 50) return "😊 괜찮아요!";
    return "💪 다음엔 더 잘할 수 있어요!";
  };

  const getReactionScoreMessage = (avgTime: number) => {
    if (avgTime < 0.2) return "⚡ 놀라운 반응속도!";
    if (avgTime < 0.3) return "👍 빠른 반응속도!";
    if (avgTime < 0.5) return "😊 보통 반응속도";
    return "💪 더 연습해보세요!";
  };

  const getNumberSequenceMessage = (avgTime: number) => {
    if (avgTime < 1.0) return "⚡ 놀라운 속도!";
    if (avgTime < 1.5) return "👍 빠른 속도!";
    if (avgTime < 2.0) return "😊 적절한 속도";
    return "💪 시간 초과가 많았어요!";
  };

  // 가위바위보 게임이고 80점 이상인지 확인
  const isRPSGame = location.state?.gameType === 'rps';
  const showBurningMode = isRPSGame && score >= 80;

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6">
        <div className="w-full max-w-md">
          {/* 결과 헤더 */}
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 md:mb-4">
              {isReactionGame ? '반응속도 결과' : isNumberSequenceGame ? '숫자 순서 결과' : '오늘의 점수'}
            </h1>
            <div 
              className="font-black text-console-green mb-3 sm:mb-4 md:mb-6 tracking-wider drop-shadow-lg"
              style={{ 
                fontSize: (isReactionGame || isNumberSequenceGame) ? 'clamp(1.5rem, 6vw, 2.5rem)' : 'clamp(2rem, 8vw, 4rem)',
                fontWeight: '900'
              }}
            >
              {(isReactionGame || isNumberSequenceGame) ? `${averageReactionTime.toFixed(3)}초` : `${score}점`}
            </div>
            <p className="text-sm sm:text-base md:text-lg">
              {isReactionGame 
                ? getReactionScoreMessage(averageReactionTime)
                : isNumberSequenceGame
                ? getNumberSequenceMessage(averageReactionTime)
                : getScoreMessage(score)
              }
            </p>
          </div>

          {/* 상세 결과 */}
          <div className="console-window mb-6 sm:mb-8 md:mb-12" style={{ padding: '2rem' }}>
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              <div className="flex justify-between items-center text-xs sm:text-sm md:text-base">
                <span>{(isReactionGame || isNumberSequenceGame) ? '평균 속도:' : '맞춘 개수:'}</span>
                <span className="font-bold">
                  {(isReactionGame || isNumberSequenceGame)
                    ? `${averageReactionTime.toFixed(3)}초` 
                    : `${result.correct}/${result.total}`
                  }
                </span>
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
                className="pixel-button w-full text-xs sm:text-sm md:text-base py-3 sm:py-4"
                onClick={() => {
                  const shareText = isReactionGame 
                    ? `반응속도 테스트 결과 평균 ${averageReactionTime.toFixed(3)}초를 기록했습니다!\n${result.total}번의 테스트를 완료했어요.\n당신도 반응속도를 테스트해보세요!⚡\n\nhttps://alwaysdo.xyz/`
                    : isNumberSequenceGame
                    ? `숫자 순서 맞추기에서 평균 ${averageReactionTime.toFixed(3)}초를 기록했습니다!\n${result.total}문제를 완료했어요.\n당신도 도전해보세요!🔢\n\nhttps://alwaysdo.xyz/`
                    : `두뇌를 수련한 결과 ${score}점을 획득했습니다!\n${result.correct}/${result.total} 문제를 맞췄어요.\n당신도 꾸준히 수련해보세요.🧠\n\nhttps://alwaysdo.xyz/`;
                  navigator.clipboard.writeText(shareText);
                  alert('공유 텍스트가 클립보드에 복사되었습니다!');
                }}
              >
               🤝 내 결과 자랑하기 
              </button>

            {/* 초고난이도 모드 버튼 */}
            {showBurningMode && (
              <button
                className="pixel-button burning-button w-full text-xs sm:text-sm md:text-base py-3 sm:py-4"
                onClick={() => {
                  track('burning_mode_started', {
                    previousScore: score,
                    gameType: 'rps-burning'
                  });
                  navigate('/game/rps-burning');
                }}
                style={{ whiteSpace: 'pre-line', paddingTop: '10px', paddingBottom: '10px'}}
              >
                🔥 (고수를 위한 비밀 기능){'\n'}초고난이도 모드를 도전해보시겠어요?
              </button>
            )}
            
            <button
              className="pixel-button w-full text-xs sm:text-sm md:text-base py-3 sm:py-4 md:py-5"
              onClick={() => navigate('/')}
            >
              홈으로
            </button>
          </div>

          {/* 설정 진입점 */}
          {!isReactionGame && !isNumberSequenceGame && 
          <div className="mt-6 sm:mt-8 md:mt-10 text-center">
            <p className="text-xs sm:text-sm text-console-fg/70 mb-3 sm:mb-4">
              퀴즈 개수를 늘리고 싶다면?
            </p>
            <button
              className="pixel-button px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base"
              onClick={() => navigate('/settings')}
            >
              설정하기
            </button>
          </div>
          }
        </div>
      </div>
    </>
  );
};
