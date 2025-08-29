import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReleaseNoteCard } from '../components/ReleaseNoteCard';
import { releaseNotes, markVersionAsViewed } from '../lib/releaseNotes';

export const ReleaseNotes: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 릴리즈 노트를 보면 현재 버전을 마지막으로 본 것으로 표시
    markVersionAsViewed();
  }, []);

  return (
    <div className="min-h-screen p-2 sm:p-3 md:p-4">
      <p></p>
      {/* 헤더 */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <button
          className="pixel-button mb-3 sm:mb-4 md:mb-6 text-xs sm:text-sm"
          onClick={() => navigate('/')}
        >
          ← 홈으로
        </button>
        <h1 className="text-base sm:text-lg md:text-xl font-bold text-center">📋 업데이트 내역</h1>
      </div>

      {/* 릴리즈 노트 목록 */}
      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        {releaseNotes.map((releaseNote, index) => (
          <ReleaseNoteCard key={index} releaseNote={releaseNote} />
        ))}
      </div>

      {/* 하단 여백 */}
      <div className="text-center text-[8px] sm:text-[10px] md:text-xs text-console-fg/40 pb-1" style={{padding: '1rem'}}>
        <a 
          href="https://www.instagram.com/alwaysdo.xyz" 
          target="_blank" 
          rel="noopener noreferrer"
          className="transition-colors duration-200 underline decoration-dotted underline-offset-2"
          style={{
            color: '#f9a8d4',
            textShadow: '0 0 4px rgba(236, 72, 153, 0.3)',
            textDecoration: 'underline',
            textDecorationStyle: 'dotted',
            textDecorationColor: '#f9a8d4'
          }}
        >
          @alwaysdo.xyz
        </a>
      </div>
    </div>
  );
};
