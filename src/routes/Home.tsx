import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { track } from '@vercel/analytics';
import { GameCard } from '../components/GameCard';
import { useSettingsStore } from '../stores/settings';
import { useDailyQuizStore } from '../stores/dailyQuiz';
import { APP_VERSION, hasNewUpdates } from '../lib/releaseNotes';
import { BETA_GAMES } from '../lib/betaGames';
import type { BetaGame } from '../lib/betaGames';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { uiMode } = useSettingsStore();
  const { resetQuiz } = useDailyQuizStore();

  useEffect(() => {
    console.log('Home component mounted');
    console.log('uiMode:', uiMode);
  }, [uiMode]);

  const games: Array<{
    id: string;
    icon: string;
    title: string;
    description: string;
    path: string;
    disabled: boolean;
    comingSoon?: boolean;
    difficulty?: 'easy' | 'medium' | 'hard';
    isNew?: boolean;
  }> = [
    // {
    //   id: 'twoInARow',
    //   icon: '⚾️',
    //   title: '2연석\n줍줍 ⚾️',
    //   description: '티켓팅 대비\n2연석 줍줍',
    //   path: '/game/two-in-a-row',
    //   disabled: false,
    //   isNew: true
    // },
    // {
    //   id: 'driving',
    //   icon: '🚗',
    //   title: '픽셀\n드라이빙',
    //   description: '장애물 피하기\n20초 생존!',
    //   path: '/game/driving',
    //   disabled: false,
    //   isNew: true
    // },
    {
      id: 'rps',
      icon: '✊',
      title: '지시문\n가위바위보',
      description: '고수에게는 BURNING MODE\n기회가 생겨요🚨',
      path: '/game/rps',
      disabled: false,
    },
    {
      id: 'numberSequence',
      icon: '🔢',
      title: '순서대로 \n숫자 누르기',
      description: '1부터 5까지\n순서대로 누르기!',
      path: '/game/number-sequence',
      disabled: false,
    },
    {
      id: 'verification',
      icon: '📱',
      title: '인증번호\n외우기',
      description: '6자리 수\n기억하기',
      path: '/game/verification',
      disabled: false
    },
    {
      id: 'dollar',
      icon: '💵',
      title: '달러 암산',
      description: '$40 = ?원',
      path: '/game/dollar',
      disabled: false
    },
    {
      id: 'area',
      icon: '📏',
      title: '평수 변환',
      description: '1평 = ?㎡',
      path: '/game/area',
      disabled: false,
      difficulty: 'hard'
    },
    {
      id: 'dream',
      icon: '👴',
      title: '꿈에서\n할아버지가..',
      description: '뭐라고 하셨더라?',
      path: '/game/dream',
      disabled: false,
      difficulty: 'hard'
    },
    {
      id: 'reaction',
      icon: '⚡',
      title: '뱅샐 유전자검사 대비 훈련장',
      description: '3,2,1... 클릭!',
      path: '/game/reaction',
      disabled: false
    }, 
    {
      id: 'commingSoon',
      icon: '🚧',
      title: '준비중',
      description: '준비중',
      path: '/game/commingSoon',
      disabled: true,
      comingSoon: true
    }
  ];

  return (
    <div className="min-h-screen p-2 sm:p-3 md:p-4 relative" style={{paddingBottom: '20px'}}>
      <p></p>
      {/* 픽셀 마스코트 */}
      <div className="text-center mb-4 sm:mb-6 md:mb-8">
        <div className="pixel-mascot mx-auto mb-2 sm:mb-3 md:mb-4"></div>
        <h1 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 md:mb-3">두뇌수련</h1>
        <p className="text-xs sm:text-sm text-console-fg/70">늘 두뇌를 수련하십시오.</p>
      </div>

      {/* 베타 게임 배너 영역 - 픽셀 아트 게임 스타일 */}
      {BETA_GAMES.length > 0 && (
        <div className="mb-4 sm:mb-6 md:mb-8">
          {/* 메인 배너 헤더 */}
          <div 
            className="relative mb-2 py-2 px-3 text-center"
            style={{
              background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4)',
              backgroundSize: '400% 400%',
              animation: 'gradient 3s ease infinite',
              border: '3px solid #FFD93D',
              borderRadius: '0px',
              boxShadow: 'inset 0 0 8px rgba(255, 217, 61, 0.4), 0 0 15px rgba(255, 217, 61, 0.2)'
            }}
          >
            <div className="absolute top-0 right-0">
              <span 
                className="text-[10px] font-bold px-1 py-0.5"
                style={{
                  background: '#FF4757',
                  color: '#FFFFFF',
                  border: '1px solid #FFFFFF',
                  borderRadius: '0px',
                  textShadow: '1px 1px 0px #000000'
                }}
              >
                🎮 BETA
              </span>
            </div>
            <h3 
              className="text-xs sm:text-sm font-bold"
              style={{
                color: '#FFFFFF',
                textShadow: '2px 2px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000',
                fontFamily: 'Press Start 2P, monospace'
              }}
            >
              ✨ NEW GAMES ✨
            </h3>
          </div>

          {/* 게임 카드들 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {BETA_GAMES.map((game: BetaGame) => (
              <div
                key={game.id}
                className="relative cursor-pointer transition-all duration-200 group"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: '3px solid #FFD93D',
                  borderRadius: '0px',
                  boxShadow: '4px 4px 0px #000000',
                  padding: '12px'
                }}
                onClick={() => {
                  track('beta_game_clicked', {
                    gameType: game.id,
                    gameTitle: game.title,
                  });
                  resetQuiz();
                  navigate(game.path);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '6px 6px 0px #000000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '4px 4px 0px #000000';
                }}
              >
                {/* NEW 뱃지 */}
                <div 
                  className="absolute -top-1 -right-1 text-[10px] font-bold px-1 py-0.5"
                  style={{
                    background: '#FF6B6B',
                    color: '#FFFFFF',
                    border: '1px solid #FFFFFF',
                    borderRadius: '0px',
                    textShadow: '1px 1px 0px #000000',
                    transform: 'rotate(15deg)',
                    zIndex: 10
                  }}
                >
                  NEW
                </div>

                <div className="flex items-center space-x-3" style={{ paddingRight: '8px' }}>
                  {/* 게임 아이콘 */}
                  <div 
                    className="text-2xl sm:text-3xl flex-shrink-0 relative"
                    style={{
                      filter: 'drop-shadow(2px 2px 0px #000000)',
                      animation: 'bounce 2s infinite',
                      zIndex: 20
                    }}
                  >
                    {game.icon}
                  </div>
                  
                  {/* 게임 정보 */}
                  <div className="flex-1 min-w-0 text-center" style={{ marginTop: '2px' }}>
                    <div 
                      className="text-sm sm:text-base font-bold leading-tight"
                      style={{
                        color: '#FFFFFF',
                        textShadow: '2px 2px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000',
                        fontFamily: 'Press Start 2P, monospace',
                        whiteSpace: 'pre-line'
                      }}
                    >
                      {game.title}
                    </div>
                  </div>
                  
                  {/* PLAY 버튼 */}
                  <div 
                    className="text-xs font-bold px-3 py-2 group-hover:animate-pulse"
                    style={{
                      background: '#4ECDC4',
                      color: '#000000',
                      border: '2px solid #FFFFFF',
                      borderRadius: '0px',
                      textShadow: 'none',
                      fontFamily: 'Press Start 2P, monospace'
                    }}
                  >
                    PLAY
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <p></p>
      {/* 게임 선택 카드 그리드 */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
        {games.map((game) => (
          <GameCard
            key={game.id}
            icon={game.icon}
            title={game.title}
            description={game.description}
            onClick={() => {
              if (!game.disabled) {
                track('game_started', {
                  gameType: game.id,
                  gameTitle: game.title,
                });
                // 게임 시작 전 상태 초기화
                resetQuiz();
                navigate(game.path);
              }
            }}
            disabled={game.disabled}
            comingSoon={game.comingSoon}
            difficulty={game.difficulty}
            isNew={game.isNew}
          />
        ))}
      </div>

      <p></p>
      {/* 설정 및 업데이트 버튼 - 카드 하위 */}
      <div className="flex justify-between items-center mb-4">
        <button
          className={`pixel-button px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base shadow-lg relative ${
            hasNewUpdates() ? 'border-console-red' : ''
          }`}
          onClick={() => navigate('/release-notes')}
        >
          📋 업데이트
          {hasNewUpdates() && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-console-red rounded-full"></span>
          )}
        </button>
        <button
          className="pixel-button px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base shadow-lg"
          onClick={() => navigate('/settings')}
        >
          설정
        </button>
      </div>
      
      <p></p>
      <p></p>
      {/* Footer 영역 - 하단 여백 */}
      <div className="h-12 sm:h-16 md:h-20"></div>
      <div className="text-center text-[8px] sm:text-[10px] md:text-xs text-console-fg/40 pb-1">
        {APP_VERSION}{' '}
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
