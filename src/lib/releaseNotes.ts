import type { ReleaseNote } from '../types';

export const APP_VERSION = 'v1.1.0';
export const APP_BUILD_DATE = '2025-08-29';

export const releaseNotes: ReleaseNote[] = [
  {
    version: 'v1.1.0',
    date: '2025.08.29',
    title: '가위바위보 게임 추가',
    changes: [
      { type: '🎮', description: '가위바위보 게임 추가' },
      { type: '🎨', description: 'UI 개선' }
    ]
  },
  {
    version: 'v1.0.0',
    date: '2025.08.27',
    title: '첫 출시',
    changes: [
      { type: '🎮', description: '두뇌 수련 게임' },
      { type: '📱', description: '모바일 최적화' },
      { type: '⚙️', description: '설정 기능' }
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

// 최신 릴리즈 노트 가져오기
export const getLatestReleaseNote = (): ReleaseNote | null => {
  return releaseNotes.length > 0 ? releaseNotes[0] : null;
};
