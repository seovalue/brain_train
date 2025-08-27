import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ConsoleWindow } from '../components/ConsoleWindow';
import { useSettingsStore } from '../stores/settings';
import type { Difficulty } from '../types';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const {
    exchangeRate,
    difficulty,
    questionCount,
    setExchangeRate,
    setDifficulty,
    setQuestionCount
  } = useSettingsStore();

  const difficulties: { value: Difficulty; label: string }[] = [
    { value: 'easy', label: '하' },
    { value: 'medium', label: '중' },
    { value: 'hard', label: '상' }
  ];

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
      {/* 난이도 설정 */}
      <ConsoleWindow title="난이도 설정" className="mb-8 sm:mb-10 md:mb-12">
        <div className="space-y-4 sm:space-y-6 md:space-y-8 p-4 sm:p-6 md:p-8">
          <div>
            <label className="block text-xs sm:text-sm mb-3 sm:mb-4 md:mb-5">게임 난이도</label>
            <div className="flex gap-3 sm:gap-4 md:gap-5">
              {difficulties.map((diff) => (
                <button
                  key={diff.value}
                  className={`pixel-button flex-1 text-xs sm:text-sm md:text-base py-3 sm:py-4 md:py-5 transition-all duration-200 ${
                    difficulty === diff.value 
                      ? 'bg-console-green text-console-bg border-console-green shadow-lg transform scale-105' 
                      : 'hover:border-console-green'
                  }`}
                  onClick={() => setDifficulty(diff.value)}
                >
                  {diff.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-console-fg/70 mt-2">현재 설정: {difficulties.find(d => d.value === difficulty)?.label}</p>
          </div>
        </div>
      </ConsoleWindow>

      {/* 저장 완료 메시지 */}
      <div className="text-center text-xs sm:text-sm text-console-fg/70 mt-6 sm:mt-8 md:mt-10">
        설정이 자동으로 저장됩니다
      </div>
    </div>
  );
};
