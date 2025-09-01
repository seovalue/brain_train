export interface BetaGame {
  id: string;
  icon: string;
  title: string;
  description: string;
  path: string;
}

// 베타 게임들을 직접 상수로 관리
export const BETA_GAMES: BetaGame[] = [
  {
    id: 'twoInARow',
    icon: '⚾️',
    title: '️2연석 줍줍 게임',
    description: '',
    path: '/game/two-in-a-row'
  },
  {
    id: 'driving',
    icon: '🚗',
    title: '피해요! 자동차 게임',
    description: '',
    path: '/game/driving'
  }
];
