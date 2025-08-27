import React, { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import html2canvas from 'html2canvas';
import type { GameResult } from '../types';
import { ShareImage } from '../components/ShareImage';

export const Result: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result as GameResult;
  const shareImageRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');

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
  
  // 반응속도 게임의 경우 평균 반응속도 사용
  const averageReactionTime = result.averageReactionTime || 0;

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

  const handleImageShare = async () => {
    if (!shareImageRef.current) return;

    try {
      const canvas = await html2canvas(shareImageRef.current, {
        width: 1200,
        height: 1200,
        scale: 1,
        backgroundColor: '#1C1C2A',
        useCORS: true,
        allowTaint: true
      });

      const imageUrl = canvas.toDataURL('image/png');
      setPreviewImage(imageUrl);
      setShowPreview(true);
    } catch (error) {
      console.error('이미지 생성 실패:', error);
      alert('이미지 생성에 실패했습니다.');
    }
  };

  return (
    <>
      {/* 공유용 이미지 (숨김) */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <ShareImage ref={shareImageRef} result={result} score={score} gameType={location.state?.gameType} />
      </div>

      {/* 이미지 공유 모달 */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-3 sm:p-4 md:p-6">
          <div className="console-window max-w-full max-h-full overflow-auto" style={{ padding: '2rem' }}>
            {/* 모달 헤더 */}
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-console-green">이미지 공유하기</h3>
            </div>

            {/* 이미지 표시 */}
            <div className="mb-4 sm:mb-6">
              <img 
                src={previewImage} 
                alt="공유 이미지" 
                className="max-w-full h-auto border-4 border-console-green"
                style={{ maxHeight: '60vh' }}
              />
            </div>

            {/* 액션 버튼들 */}
            <div className="space-y-3 sm:space-y-4">
              <button
                className="pixel-button w-full text-xs sm:text-sm md:text-base py-3 sm:py-4"
                onClick={() => {
                  const link = document.createElement('a');
                  link.download = `두뇌수련-${score}점-${new Date().toISOString().split('T')[0]}.png`;
                  link.href = previewImage;
                  link.click();
                }}
              >
                💾 이미지 다운로드
              </button>
              
              <button
                className="pixel-button w-full text-xs sm:text-sm md:text-base py-3 sm:py-4"
                onClick={() => {
                  const shareText = isReactionGame 
                    ? `반응속도 테스트 결과 평균 ${averageReactionTime.toFixed(3)}초를 기록했습니다!\n${result.total}번의 테스트를 완료했어요.\n당신도 반응속도를 테스트해보세요!⚡\n\nhttps://brain-train-ing.vercel.app/`
                    : `두뇌를 수련한 결과 ${score}점을 획득했습니다!\n${result.correct}/${result.total} 문제를 맞췄어요.\n당신도 꾸준히 수련해보세요.🧠\n\nhttps://brain-train-ing.vercel.app/`;
                  navigator.clipboard.writeText(shareText);
                  alert('공유 텍스트가 클립보드에 복사되었습니다!');
                }}
              >
                📋 공유 텍스트 복사
              </button>
              
              <button
                className="pixel-button w-full text-xs sm:text-sm md:text-base py-3 sm:py-4"
                onClick={() => setShowPreview(false)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6">
        <div className="w-full max-w-md">
          {/* 결과 헤더 */}
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 md:mb-4">
              {isReactionGame ? '반응속도 결과' : '오늘의 점수'}
            </h1>
            <div 
              className="font-black text-console-green mb-3 sm:mb-4 md:mb-6 tracking-wider drop-shadow-lg"
              style={{ 
                fontSize: isReactionGame ? 'clamp(1.5rem, 6vw, 2.5rem)' : 'clamp(2rem, 8vw, 4rem)',
                fontWeight: '900'
              }}
            >
              {isReactionGame ? `${averageReactionTime.toFixed(3)}초` : `${score}점`}
            </div>
            <p className="text-sm sm:text-base md:text-lg">
              {isReactionGame 
                ? getReactionScoreMessage(averageReactionTime)
                : getScoreMessage(score)
              }
            </p>
          </div>

          {/* 상세 결과 */}
          <div className="console-window mb-6 sm:mb-8 md:mb-12" style={{ padding: '2rem' }}>
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              <div className="flex justify-between items-center text-xs sm:text-sm md:text-base">
                <span>{isReactionGame ? '평균 반응속도:' : '맞춘 개수:'}</span>
                <span className="font-bold">
                  {isReactionGame 
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
              className="pixel-button w-full text-xs sm:text-sm md:text-base py-3 sm:py-4 md:py-5"
              onClick={handleImageShare}
            >
              🖼️ 결과 공유하기
            </button>
            
            <button
              className="pixel-button w-full text-xs sm:text-sm md:text-base py-3 sm:py-4 md:py-5"
              onClick={() => navigate('/')}
            >
              홈으로
            </button>
          </div>

          {/* 설정 진입점 */}
          {!isReactionGame && 
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
