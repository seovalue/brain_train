import { forwardRef } from 'react';
import type { GameResult } from '../types';

interface ShareImageProps {
  result: GameResult;
  score: number;
}

export const ShareImage = forwardRef<HTMLDivElement, ShareImageProps>(({ result, score }, ref) => {
  const getScoreMessage = (score: number) => {
    if (score >= 90) return "🎉 완벽합니다!";
    if (score >= 70) return "👍 잘했어요!";
    if (score >= 50) return "😊 괜찮아요!";
    return "💪 다음엔 더 잘할 수 있어요!";
  };

  const timeInSeconds = result.ms ? Math.floor(result.ms / 1000) : 0;
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;

  return (
    <div 
      ref={ref}
      id="share-image"
      className="w-[1200px] h-[1200px] bg-[#1C1C2A] flex items-center justify-center p-12"
      style={{ fontFamily: 'Press Start 2P, monospace' }}
    >
      <div className="text-center text-white">
        {/* 앱 로고/제목 */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-[#88FF88] mb-3">두뇌수련</h1>
          <p className="text-2xl text-[#E0E0E0]">Brain Training</p>
        </div>

        {/* 점수 표시 */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-6">오늘의 점수</h2>
          <div 
            className="font-black text-[#88FF88] mb-6 tracking-wider"
            style={{ fontSize: '8rem', fontWeight: '900' }}
          >
            {score}점
          </div>
          <p className="text-2xl">{getScoreMessage(score)}</p>
        </div>

        {/* 상세 결과 */}
        <div className="bg-[#2A2A3A] border-4 border-[#88FF88] p-8 mb-10">
          <div className="space-y-5 text-xl">
            <div className="flex justify-between items-center">
              <span>맞춘 개수:</span>
              <span className="font-bold text-[#88FF88]">{result.correct}/{result.total}</span>
            </div>
            
            {result.ms && (
              <div className="flex justify-between items-center">
                <span>소요 시간:</span>
                <span className="font-bold text-[#88FF88]">
                  {minutes}분 {seconds}초
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 웹사이트 URL */}
        <div className="text-center">
          <p className="text-xl text-[#E0E0E0] mb-3">당신도 도전해보세요!</p>
          <p className="text-2xl text-[#5599FF] font-bold">brain-train-ing.vercel.app</p>
        </div>
      </div>
    </div>
  );
});
