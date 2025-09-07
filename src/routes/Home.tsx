import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { track } from '@vercel/analytics';
import { GameListItem } from '../components/GameListItem';
import { PromoBanner } from '../components/PromoBanner';
import { useSettingsStore } from '../stores/settings';
import { useDailyQuizStore } from '../stores/dailyQuiz';
import { APP_VERSION, hasNewUpdates } from '../lib/releaseNotes';
import { PROMO_GAMES } from '../lib/betaGames';
import { useCommuteSession } from '../stores/commuteSession';
import { getSeoulDateKey } from '../lib/commute/date';
import { useSEO } from '../lib/seo/useSEO';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { uiMode } = useSettingsStore();
  const { resetQuiz } = useDailyQuizStore();
  const { hasPlayedToday, dateKey, startAutoSession } = useCommuteSession();

  // SEO
  useSEO({
    title: '두뇌 훈련 미니게임 모음',
    description: '가위바위보, 인증번호 외우기, 달러 암산, 평수 변환 등 성인을 위한 레트로 콘솔 감성의 두뇌 훈련 게임을 즐겨보세요.',
    robots: 'index,follow',
  });

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
    {
      id: 'driving',
      icon: '🚗',
      title: '피해요! 자동차 게임',
      description: '장애물을 피해서 자동차를 전진!',
      path: '/game/driving',
      disabled: false,
    },
    {
      id: 'twoInARow',
      icon: '⚾️',
      title: '2연석\n줍줍 ⚾️',
      description: '티켓팅 대비\n2연석 줍줍',
      path: '/game/two-in-a-row',
      disabled: false,
    },
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

  // 프로모 배너 대상: 우선 베타 게임 목록의 첫 항목, 없으면 isNew 표시된 게임
  const promo = (PROMO_GAMES && PROMO_GAMES.length > 0)
    ? { icon: PROMO_GAMES[0].icon, title: PROMO_GAMES[0].title, description: PROMO_GAMES[0].description, path: PROMO_GAMES[0].path, id: PROMO_GAMES[0].id }
    : (() => {
        const g = games.find((x) => x.isNew && !x.disabled);
        return g ? { icon: g.icon, title: g.title, description: g.description, path: g.path, id: g.id } : null;
      })();

  return (
    <div className="min-h-screen p-2 sm:p-3 md:p-4 relative" style={{paddingBottom: '20px'}}>
      <p></p>
      {/* 픽셀 마스코트 */}
      <div className="text-center mb-4 sm:mb-6 md:mb-8">
        <div className="pixel-mascot mx-auto mb-2 sm:mb-3 md:mb-4"></div>
        <h3 className="text-base sm:text-lg md:text-xl font-bold mb-0">두뇌수련</h3>
        <p className="text-xs sm:text-sm text-console-fg/70 mt-0">늘 두뇌를 수련하십시오.</p>
      </div>

      {/* 출근길 두뇌훈련 섹션 */}
      <div className="console-window p-4 sm:p-5 mb-4 relative overflow-hidden" style={{ padding: '10px' }}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-lg sm:text-xl font-pixel font-bold mb-2 tracking-wide text-shadow-pixel flex items-center gap-2">
              <span className="text-2xl" style={{paddingRight: '5px'}}>✍️ </span>
              <span className="truncate">출근길 두뇌훈련</span>
            </div>
            <div className="text-xs sm:text-sm text-console-fg/80 leading-snug">
              출근 전 두뇌 워밍업!
            </div>
          </div>
          <button
            className="pixel-button px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-bold"
            onClick={() => { startAutoSession(); navigate('/commute/play'); }}
            disabled={hasPlayedToday && dateKey === getSeoulDateKey()}
          >
            시작하기 ›
          </button>
        </div>
        {(hasPlayedToday && dateKey === getSeoulDateKey()) && (
          <div className="mt-2 sm:text-xs text-console-red" style={{fontSize: '12px'}}>내일 다시 만나요~</div>
        )}
        {/* 액센트 보더 강조 */}
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 0 2px var(--console-blue)' }}></div>
      </div>

      {/* 광고형 프로모 배너: 한 구좌 */}
      {promo && (
        <PromoBanner
          icon={promo.icon}
          title={promo.title}
          description={promo.description}
          cta="PLAY"
          onClick={() => {
            track('promo_clicked', { gameType: promo.id, gameTitle: promo.title });
            resetQuiz();
            navigate(promo.path);
          }}
        />
      )}
      {/* 스크롤 가능한 리스트뷰: 세로 높이를 더 줄여 내부 스크롤 */}
      <div className="mb-4 sm:mb-6 md:mb-8 max-h-[45vh] overflow-y-auto pr-1 space-y-2">
        {games.filter(g => !g.comingSoon).map((game) => (
          <GameListItem
            key={game.id}
            icon={game.icon}
            title={game.title}
            description={game.description}
            disabled={game.disabled}
            difficulty={game.difficulty}
            isNew={game.isNew}
            onClick={() => {
              if (!game.disabled) {
                track('game_started', { gameType: game.id, gameTitle: game.title });
                resetQuiz();
                navigate(game.path);
              }
            }}
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
