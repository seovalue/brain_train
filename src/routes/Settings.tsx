import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ConsoleWindow } from '../components/ConsoleWindow';
import { useSettingsStore } from '../stores/settings';
import { APP_VERSION } from '../lib/releaseNotes';
import { useSEO } from '../lib/seo/useSEO';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  // 설정 화면은 검색 가치 낮음 → noindex 권장
  useSEO({
    title: '설정 - 환율/문제 개수',
    description: '달러 환율과 게임당 문제 개수를 설정합니다.',
    robots: 'noindex,follow',
  });
  const {
    exchangeRate,
    questionCount,
    setExchangeRate,
    setQuestionCount
  } = useSettingsStore();

  const questionCounts: { value: 3 | 5 | 7 | 10; label: string }[] = [
    { value: 3, label: '3개' },
    { value: 5, label: '5개' },
    { value: 7, label: '7개' },
    { value: 10, label: '10개' }
  ];

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
        <h1 className="text-base sm:text-lg md:text-xl font-bold text-center">설정</h1>
      </div>

      {/* 환율 설정 */}
      <ConsoleWindow title="환율 설정" className="mb-6 sm:mb-8 md:mb-10">
        <div className="space-y-3 sm:space-y-4 md:space-y-6 p-3 sm:p-4 md:p-6">
          <div>
            <label className="block text-xs sm:text-sm mb-3 sm:mb-4 md:mb-5">달러 환율 (원)</label>
            <input
              type="number"
              className="number-input w-full text-xs sm:text-sm md:text-base"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(Number(e.target.value))}
              min="1"
              max="10000"
            />
            <p className="text-xs text-console-fg/70 mt-2">현재 설정: {exchangeRate}원</p>
          </div>
        </div>
      </ConsoleWindow>

      <p></p>
      {/* 문제 개수 설정 */}
      <ConsoleWindow title="문제 개수 설정" className="mb-6 sm:mb-8 md:mb-10">
        <div className="space-y-4 sm:space-y-6 md:space-y-8 p-4 sm:p-6 md:p-8">
          <div>
            <label className="block text-xs sm:text-sm mb-3 sm:mb-4 md:mb-5">게임당 문제 개수</label>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
              {questionCounts.map((count) => (
                <button
                  key={count.value}
                  className={`pixel-button text-xs sm:text-sm md:text-base py-3 sm:py-4 md:py-5 transition-all duration-200 ${
                    questionCount === count.value 
                      ? 'bg-console-blue text-console-bg border-console-blue shadow-lg transform scale-105' 
                      : 'hover:border-console-blue'
                  }`}
                  onClick={() => setQuestionCount(count.value)}
                >
                  {count.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-console-fg/70 mt-2">현재 설정: {questionCount}개</p>
          </div>
        </div>
      </ConsoleWindow>

      <p></p>
      {/* 앱 정보 */}
      <ConsoleWindow title="앱 정보" className="mb-6 sm:mb-8 md:mb-10">
        <div className="space-y-4 sm:space-y-6 md:space-y-8 p-4 sm:p-6 md:p-8">
          <div className="text-center">
            <p className="text-xs sm:text-sm md:text-base mb-2">현재 버전</p>
            <p className="text-xs sm:text-sm md:text-base font-bold text-console-blue mb-4">{APP_VERSION}</p>
            <button
              className="pixel-button text-xs sm:text-sm md:text-base py-2 sm:py-3 md:py-4 px-4 sm:px-6 md:px-8"
              onClick={() => navigate('/release-notes')}
            >
              📋 업데이트 내역 보기
            </button>
            <p></p>
          </div>
        </div>
      </ConsoleWindow>
      
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
