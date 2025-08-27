import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Question, GameResult } from '../types';
import { generateSeed, getTodayString } from '../lib/rng';

interface DailyQuizState {
  seed: string;
  currentQuestionIndex: number;
  answers: (number | null)[];
  score: number;
  startTime?: number;
  endTime?: number;
  questions: Question[];
  currentQuestion: Question | null;
  gameType: string | null;
}

interface DailyQuizStore extends DailyQuizState {
  // Actions
  startQuiz: (questions: Question[], gameType: string) => void;
  submitAnswer: (answer: number, isCorrect?: boolean) => void;
  nextQuestion: () => void;
  finishQuiz: () => GameResult;
  resetQuiz: () => void;
}

const defaultState: DailyQuizState = {
  seed: '',
  currentQuestionIndex: 0,
  answers: [],
  score: 0,
  startTime: undefined,
  endTime: undefined,
  questions: [],
  currentQuestion: null,
  gameType: null,
};

export const useDailyQuizStore = create<DailyQuizStore>()(
  persist(
    (set, get) => ({
      ...defaultState,
      
      startQuiz: (questions: Question[], gameType: string) => {
        const today = getTodayString();
        const seed = generateSeed(today, 'medium'); // TODO: get from settings
        
        set({
          seed,
          questions,
          currentQuestionIndex: 0,
          answers: new Array(questions.length).fill(null),
          score: 0,
          startTime: Date.now(),
          endTime: undefined,
          currentQuestion: questions[0] || null,
          gameType,
        });
      },
      
      submitAnswer: (answer: number, isCorrect?: boolean) => {
        const { questions, currentQuestionIndex, answers, score } = get();
        
        if (currentQuestionIndex >= questions.length) return;
        
        const question = questions[currentQuestionIndex];
        
        // isCorrect가 제공되지 않은 경우 기본 판정 로직 사용
        const correct = isCorrect !== undefined ? isCorrect : Math.abs(answer - question.answer) < 0.01;
        
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = answer;
        
        set({
          answers: newAnswers,
          score: score + (correct ? 1 : 0),
        });
      },
      
      nextQuestion: () => {
        const { questions, currentQuestionIndex } = get();
        const nextIndex = currentQuestionIndex + 1;
        
        if (nextIndex < questions.length) {
          set({
            currentQuestionIndex: nextIndex,
            currentQuestion: questions[nextIndex] || null,
          });
        }
      },
      
      finishQuiz: () => {
        const { answers, score, startTime } = get();
        const endTimeNow = Date.now();
        
        set({ endTime: endTimeNow });
        
        const result: GameResult = {
          date: getTodayString(),
          difficulty: 'medium', // TODO: get from settings
          total: answers.length,
          correct: score,
          ms: endTimeNow - (startTime || endTimeNow),
        };
        
        // Save streak
        saveStreak(result);
        
        return result;
      },
      
      resetQuiz: () => {
        set({
          ...defaultState,
        });
      },
    }),
    {
      name: 'brain-train-quiz',
      partialize: (state) => ({
        seed: state.seed,
        currentQuestionIndex: state.currentQuestionIndex,
        answers: state.answers,
        score: state.score,
        startTime: state.startTime,
        endTime: state.endTime,
      }),
    }
  )
);

// 스트릭 저장 함수
function saveStreak(result: GameResult) {
  const streakKey = 'brain-train-streak';
  const lastResultKey = 'brain-train-last-result';
  
  const lastResult = localStorage.getItem(lastResultKey);
  const currentStreak = parseInt(localStorage.getItem(streakKey) || '0');
  
  // 오늘 이미 퀴즈를 풀었는지 확인
  if (lastResult) {
    const lastDate = JSON.parse(lastResult).date;
    if (lastDate === result.date) {
      return; // 이미 오늘 퀴즈를 풀었음
    }
  }
  
  // 연속 기록 업데이트
  if (result.correct > 0) {
    localStorage.setItem(streakKey, (currentStreak + 1).toString());
  } else {
    localStorage.setItem(streakKey, '0');
  }
  
  // 마지막 결과 저장
  localStorage.setItem(lastResultKey, JSON.stringify(result));
}

// 스트릭 조회 함수
export function getStreak(): number {
  return parseInt(localStorage.getItem('brain-train-streak') || '0');
}
