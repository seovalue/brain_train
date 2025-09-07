export interface PromoGame {
  id: string;
  icon: string;
  title: string;
  description: string;
  path: string;
}

// 베타 게임들을 직접 상수로 관리
export const PROMO_GAMES: PromoGame[] = [
  {
    id: 'omok',
    icon: '⚫',
    title: '오목',
    description: '5개를 먼저 잇기',
    path: '/game/omok',
  }
];
