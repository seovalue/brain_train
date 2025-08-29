import type { GameResult, Question } from '../../types';

// 기본 게임 결과 계산 (내부 헬퍼 함수)
function calculateDefaultGameResult(
  answers: (number | null)[],
  score: number,
  totalTime: number
): GameResult {
  return {
    date: new Date().toISOString().split('T')[0],
    difficulty: 'medium',
    total: answers.length,
    correct: score,
    ms: totalTime,
  };
}

// 반응속도 게임 결과 계산 (내부 헬퍼 함수)
function calculateReactionGameResult(
  reactionTimes: number[],
  totalTime: number
): GameResult {
  const averageReactionTime = reactionTimes.length > 0
    ? reactionTimes.reduce((sum, time) => sum + time, 0) / reactionTimes.length
    : 0;

  return {
    date: new Date().toISOString().split('T')[0],
    difficulty: 'medium',
    total: reactionTimes.length,
    correct: reactionTimes.length, // 완료한 문제 수
    ms: totalTime,
    reactionTimes,
    averageReactionTime,
  };
}

// 게임 타입별 결과 계산 팩토리
export function calculateGameResult(
  gameType: string,
  answers: (number | null)[],
  score: number,
  reactionTimes: number[],
  totalTime: number
): GameResult {
  switch (gameType) {
    case 'reaction':
      return calculateReactionGameResult(reactionTimes, totalTime);
    case 'rps':
    case 'numberSequence':
      return calculateDefaultGameResult(answers, score, totalTime);
    default:
      return calculateDefaultGameResult(answers, score, totalTime);
  }
}

// 답변 제출 결과 인터페이스
export interface SubmitAnswerResult {
  newAnswers: (number | null)[];
  newScore: number;
  newReactionTimes?: number[];
}

// 기본 게임 답변 제출 (내부 헬퍼 함수)
function submitDefaultAnswer(
  answers: (number | null)[],
  score: number,
  currentIndex: number,
  answer: number,
  question: Question,
  isCorrect?: boolean
): SubmitAnswerResult {
  const newAnswers = [...answers];
  newAnswers[currentIndex] = answer;
  
  // isCorrect가 제공되지 않은 경우 문제의 정답과 비교
  const correct = isCorrect !== undefined ? isCorrect : Math.abs(answer - question.answer) < 0.01;
  const newScore = score + (correct ? 1 : 0);
  
  return {
    newAnswers,
    newScore,
  };
}

// 반응속도 게임 답변 제출 (내부 헬퍼 함수)
function submitReactionAnswer(
  reactionTimes: number[],
  answer: number
): SubmitAnswerResult {
  const newReactionTimes = [...reactionTimes, answer];
  
  return {
    newAnswers: [], // 반응속도 게임에서는 사용하지 않음
    newScore: 0, // 반응속도 게임에서는 사용하지 않음
    newReactionTimes,
  };
}

// 게임 타입별 답변 제출 팩토리
export function submitGameAnswer(
  gameType: string,
  answers: (number | null)[],
  score: number,
  currentIndex: number,
  answer: number,
  question: Question,
  reactionTimes: number[],
  isCorrect?: boolean
): SubmitAnswerResult {
  switch (gameType) {
    case 'reaction':
      return submitReactionAnswer(reactionTimes, answer);
    case 'rps':
    case 'numberSequence':
      return submitDefaultAnswer(answers, score, currentIndex, answer, question, isCorrect);
    default:
      return submitDefaultAnswer(answers, score, currentIndex, answer, question, isCorrect);
  }
}
