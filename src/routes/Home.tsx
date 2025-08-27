import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameCard } from '../components/GameCard';
import { useSettingsStore } from '../stores/settings';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { uiMode } = useSettingsStore();

  useEffect(() => {
    console.log('Home component mounted');
    console.log('uiMode:', uiMode);
  }, [uiMode]);

  const games = [
    {
      id: 'dollar',
      icon: '💵',
      title: '달러 암산',
      description: '$400 = ?원',
      path: '/game/dollar',
      disabled: false
    },
    {
      id: 'area',
      icon: '📏',
      title: '평수 변환',
      description: '10평 = ?㎡',
      path: '/game/area',
      disabled: false
    },
    {
      id: 'coming1',
      icon: '🧮',
      title: '수학 퀴즈',
      description: '곧 출시 예정!',
      path: '',
      disabled: true,
      comingSoon: true
    },
    {
      id: 'coming2',
      icon: '🎯',
      title: '기억력 게임',
      description: '준비 중...',
      path: '',
      disabled: true,
      comingSoon: true
    }
  ];

  return (
    <div className="min-h-screen p-2 sm:p-3 md:p-4 relative">
      {/* 픽셀 마스코트 */}
      <div className="text-center mb-4 sm:mb-6 md:mb-8">
        <div className="pixel-mascot mx-auto mb-2 sm:mb-3 md:mb-4"></div>
        <h1 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 md:mb-3">두뇌수련</h1>
        <p className="text-xs sm:text-sm text-console-fg/70">콘솔 게임 스타일 두뇌 훈련</p>
      </div>

      {/* 게임 선택 카드 그리드 */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
        {games.map((game) => (
          <GameCard
            key={game.id}
            icon={game.icon}
            title={game.title}
            description={game.description}
            onClick={() => !game.disabled && navigate(game.path)}
            disabled={game.disabled}
            comingSoon={game.comingSoon}
          />
        ))}
      </div>

      <p></p>
      {/* 설정 버튼 - 우측 하단 고정 */}
      <button
        className="pixel-button fixed bottom-3 right-3 sm:bottom-4 sm:right-4 md:bottom-6 md:right-6 px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base shadow-lg z-10"
        onClick={() => navigate('/settings')}
      >
        설정
      </button>
    </div>
  );
};
