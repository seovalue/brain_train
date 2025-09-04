import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getSeoulDateKey } from '../lib/commute/date';
import { median } from '../lib/commute/scoring';
import { SeededRNG } from '../lib/rng';

export type CommuteGameId =
  | 'meeting-sum'
  | 'team-split'
  | 'deploy-countdown'
  | 'scheduling-lite'
  | 'prioritization-lite';

export interface CommuteGameMeta {
  id: CommuteGameId;
  icon: string;
  title: string; // 줄바꿈 가능
  description: string; // 줄바꿈 가능
  difficulty?: 'easy' | 'medium' | 'hard';
}

export const COMMUTE_GAMES: CommuteGameMeta[] = [
  { id: 'meeting-sum', icon: '📅', title: '오늘의 회의 시간', description: '회의\n총합(분) 계산', difficulty: 'medium' },
  { id: 'team-split', icon: '🍽️', title: '팀 회식\n정산', description: '엔빵 계산', difficulty: 'medium' },
  { id: 'deploy-countdown', icon: '🚀', title: '배포일\n카운트다운', description: '배포까지 남은 날짜와 개발 기한', difficulty: 'easy' },
  { id: 'scheduling-lite', icon: '🛠️', title: '스케줄링\n문제', description: '누가 언제 일을 하는게 좋을까?', difficulty: 'hard' },
  { id: 'prioritization-lite', icon: '🎯', title: '우선순위\n정하기', description: '중요도를 바탕으로 우선순위를 계산하기', difficulty: 'hard' },
];

// QA용 임시 플래그: 모든 커뮤트 게임 5개 진행
const QA_COMMUTE_ALL = false;

export interface CommuteGameResult {
  id: CommuteGameId;
  score: number; // 게임별 점수
  correctCount?: number;
  totalCount?: number;
  reactionTimes?: number[]; // ms 목록
  details?: Record<string, unknown>;
}

interface CommuteSessionState {
  dateKey: string; // Asia/Seoul 기준 YYYY-MM-DD
  hasPlayedToday: boolean;
  selected: CommuteGameId[];
  currentIndex: number; // 진행 중인 게임 인덱스
  startedAt?: number;
  finishedAt?: number;
  results: CommuteGameResult[];
}

interface CommuteSessionStore extends CommuteSessionState {
  resetForToday: () => void;
  toggleSelect: (id: CommuteGameId) => void;
  startSession: () => void;
  autoSelectForToday: () => CommuteGameId[];
  startAutoSession: () => void;
  nextGame: () => void;
  submitGameResult: (result: CommuteGameResult) => void;
  finishSession: () => void;
}

const defaultState = (): CommuteSessionState => ({
  dateKey: getSeoulDateKey(),
  hasPlayedToday: false,
  selected: [],
  currentIndex: 0,
  startedAt: undefined,
  finishedAt: undefined,
  results: [],
});

export const useCommuteSession = create<CommuteSessionStore>()(
  persist(
    (set, get) => ({
      ...defaultState(),
      resetForToday: () => set(defaultState()),
      toggleSelect: (id) => {
        const { selected } = get();
        const exists = selected.includes(id);
        const limit = QA_COMMUTE_ALL ? 5 : 3;
        const next = exists ? selected.filter(x => x !== id) : [...selected, id].slice(0, limit);
        set({ selected: next });
      },
      startSession: () => {
        const dateKey = getSeoulDateKey();
        set({ dateKey, currentIndex: 0, startedAt: Date.now(), results: [], finishedAt: undefined });
      },
      autoSelectForToday: () => {
        const dateKey = getSeoulDateKey();
        const rng = new SeededRNG(`${dateKey}-commute`);
        let selected: CommuteGameId[];
        if (QA_COMMUTE_ALL) {
          selected = COMMUTE_GAMES.map(g => g.id);
        } else {
          const hard = COMMUTE_GAMES.filter(g => g.difficulty === 'hard').map(g => g.id);
          const others = COMMUTE_GAMES.filter(g => g.difficulty !== 'hard').map(g => g.id);
          const hardPick = rng.pick(hard);
          // others에서 2개 고유 선택 (Fisher–Yates 셔플)
          const shuffled = [...others];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(rng.next() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          const picks = (shuffled.slice(0, 2) as CommuteGameId[]);
          selected = [...picks, hardPick]; // 하드는 마지막에 배치
        }
        set({ selected, dateKey });
        return selected;
      },
      startAutoSession: () => {
        const { autoSelectForToday } = get() as unknown as CommuteSessionStore;
        autoSelectForToday();
        const dateKey = getSeoulDateKey();
        set({ dateKey, currentIndex: 0, startedAt: Date.now(), results: [], finishedAt: undefined });
      },
      nextGame: () => {
        const { currentIndex, selected } = get();
        if (currentIndex + 1 < selected.length) {
          set({ currentIndex: currentIndex + 1 });
        } else {
          get().finishSession();
        }
      },
      submitGameResult: (result) => {
        const { results } = get();
        const filtered = results.filter(r => r.id !== result.id);
        set({ results: [...filtered, result] });
      },
      finishSession: () => {
        const { dateKey, results } = get();
        const finishedAt = Date.now();
        // 간단 총점: 합계
        const totalScore = results.reduce((s, r) => s + (r.score || 0), 0);
        const allReactions = results.flatMap(r => r.reactionTimes || []);
        const medReaction = allReactions.length ? median(allReactions) : undefined;
        // 기록 저장
        const summary = {
          date: dateKey,
          totalScore,
          medReaction,
          results,
          finishedAt,
        };
        localStorage.setItem('commute-session-last', JSON.stringify(summary));
        set({ finishedAt, hasPlayedToday: true });
      },
    }),
    {
      name: 'brain-train-commute',
      partialize: (s) => ({
        dateKey: s.dateKey,
        hasPlayedToday: s.hasPlayedToday,
        selected: s.selected,
        results: s.results,
      })
    }
  )
);
