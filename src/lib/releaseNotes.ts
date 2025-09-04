import type { ReleaseNote } from '../types';

export const APP_VERSION = 'v1.6.0';
export const APP_BUILD_DATE = '2025-09-05';

export const releaseNotes: ReleaseNote[] = [
  {
    version: 'v1.6.0',  
    date: '2025.09.05',
    title: '출근길 두뇌훈련 게임 추가',
    changes: [
      { type: '🎮', description: '출근길 두뇌훈련 게임이 추가됐어요.' },
    ]
  },
  {
    version: 'v1.5.0',
    date: '2025.09.02',
    title: '피해요! 자동차 게임 추가',
    changes: [
      { type: '🎮', description: '장애물을 피해 생존하는 게임이 추가됐어요.' },
    ]
  },
  {
    version: 'v1.4.0',
    date: '2025.09.01',
    title: '2연석 찾기 게임 추가',
    changes: [
      { type: '🎮', description: '2연석을 찾는 게임이 추가됐어요.' },
    ]
  },
  {
    version: 'v1.3.0',
    date: '2025.08.30',
    title: '숫자 순서 누르기 게임 추가',
    changes: [
      { type: '🎮', description: '1부터 5까지 순서대로 누르는 게임이 추가됐어요.' },
      { type: '⚡', description: '1초 안에 순서대로 눌러야 하는 긴장감 넘치는 게임!' },
    ]
  },
  {
    version: 'v1.2.0',
    date: '2025.08.29',
    title: 'BURNING MODE 추가',
    changes: [
      { type: '🎮', description: '가위바위보 초고난이도 모드가 추가됐어요.' },
    ]
  },
  {
    version: 'v1.1.0',
    date: '2025.08.28',
    title: '가위바위보 게임 추가',
    changes: [
      { type: '🎮', description: '가위바위보 게임이 출시됐어요.' },
    ]
  },
  {
    version: 'v1.0.0',
    date: '2025.08.27',
    title: '첫 출시',
    changes: [
      { type: '🎮', description: '두뇌 수련 게임이 세상에 출시됐어요.' },
    ]
  }
];

// 신규 업데이트가 있는지 확인하는 함수
export const hasNewUpdates = (): boolean => {
  const lastViewedVersion = localStorage.getItem('last-viewed-version');
  return lastViewedVersion !== APP_VERSION;
};

// 현재 버전을 마지막으로 본 버전으로 저장
export const markVersionAsViewed = (): void => {
  localStorage.setItem('last-viewed-version', APP_VERSION);
};
