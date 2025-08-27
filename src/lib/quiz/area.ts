import type { Question, Difficulty } from '../../types';
import { SeededRNG } from '../rng';

const PYEONG_TO_SQM_RATIO = 3.3;

/**
 * 평수 변환 문제 생성
 */
export function generateAreaQuestions(
  seed: string, 
  difficulty: Difficulty,
  precision: number = 0,
  questionCount: 3 | 5 | 7 | 10 = 5
): Question[] {
  const rng = new SeededRNG(seed);
  const questions: Question[] = [];

  for (let i = 0; i < questionCount; i++) {
    const isPyeongToSqm = rng.next() > 0.5;
    
    if (isPyeongToSqm) {
      const pyeongAmount = generatePyeongAmount(rng, difficulty);
      const answer = pyeongAmount * PYEONG_TO_SQM_RATIO;
      
      questions.push({
        id: `${seed}_area_p2s_${i}`,
        type: "PYEONG_TO_SQM",
        prompt: `${pyeongAmount}평 = ?㎡`,
        icon: "📏",
        answer: Number(answer.toFixed(precision)),
        format: { decimals: difficulty === "easy" ? 0 : precision }
      });
    } else {
      const sqmAmount = generateSqmAmount(rng, difficulty);
      const answer = sqmAmount / PYEONG_TO_SQM_RATIO;
      
      questions.push({
        id: `${seed}_area_s2p_${i}`,
        type: "SQM_TO_PYEONG",
        prompt: `${sqmAmount}㎡ = ?평`,
        icon: "📏",
        answer: Number(answer.toFixed(precision)),
        format: { decimals: difficulty === "easy" ? 0 : precision }
      });
    }
  }

  return questions;
}

/**
 * 난이도에 따른 평수 생성
 */
function generatePyeongAmount(rng: SeededRNG, difficulty: Difficulty): number {
  // 국내에서 가장 많이 나오는 평수들 (제곱미터 기준으로 변환)
  const commonPyeongValues = [16.7, 17.9, 18.2, 22.4, 25.5, 30.6, 37.6, 40.9];
  
  switch (difficulty) {
    case "easy":
      // 1~30 정수 (계산하기 쉬운 값들) + 자주 나오는 평수들
      const easyValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 18, 20, 24, 25, 30];
      // 70% 확률로 자주 나오는 평수, 30% 확률로 일반 값
      return rng.next() < 0.7 ? rng.pick(commonPyeongValues) : rng.pick(easyValues);
    case "medium":
      // 5~50, 소수점 1자리 + 자주 나오는 평수들
      if (rng.next() < 0.6) {
        return rng.pick(commonPyeongValues);
      } else {
        return Number((rng.nextInt(5, 50) + rng.next()).toFixed(1));
      }
    case "hard":
      // 1~100, 랜덤 소수 + 자주 나오는 평수들
      if (rng.next() < 0.5) {
        return rng.pick(commonPyeongValues);
      } else {
        return Number((rng.nextInt(1, 100) + rng.next()).toFixed(2));
      }
    default:
      return 10;
  }
}

/**
 * 난이도에 따른 제곱미터 생성
 */
function generateSqmAmount(rng: SeededRNG, difficulty: Difficulty): number {
  // 국내에서 가장 많이 나오는 제곱미터 값들
  const commonSqmValues = [55, 59, 60, 74, 84, 101, 124, 135];
  
  switch (difficulty) {
    case "easy":
      // 3~99 (1~30평에 해당하는 계산하기 쉬운 값들) + 자주 나오는 제곱미터
      const easyValues = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60, 63, 66, 69, 72, 75, 78, 81, 84, 87, 90, 93, 96, 99];
      // 70% 확률로 자주 나오는 제곱미터, 30% 확률로 일반 값
      return rng.next() < 0.7 ? rng.pick(commonSqmValues) : rng.pick(easyValues);
    case "medium":
      // 16~165 (5~50평에 해당), 소수점 1자리 + 자주 나오는 제곱미터
      if (rng.next() < 0.6) {
        return rng.pick(commonSqmValues);
      } else {
        return Number((rng.nextInt(16, 165) + rng.next()).toFixed(1));
      }
    case "hard":
      // 3~330 (1~100평에 해당), 랜덤 소수 + 자주 나오는 제곱미터
      if (rng.next() < 0.5) {
        return rng.pick(commonSqmValues);
      } else {
        return Number((rng.nextInt(3, 330) + rng.next()).toFixed(2));
      }
    default:
      return 33;
  }
}

/**
 * 평수 문제의 계산 근거 생성
 */
export function generateAreaRationale(
  question: Question, 
  userAnswer: number,
  tolerance: number = 0.01
): string {
  const isCorrect = Math.abs(userAnswer - question.answer) <= tolerance;
  
  if (isCorrect) {
    return `▶ 정답입니다!`;
  } else {
    if (question.type === "PYEONG_TO_SQM") {
      const pyeong = parseFloat(question.prompt.split('평')[0]);
      const correctSqm = (pyeong * PYEONG_TO_SQM_RATIO).toFixed(2);
      return `▶ 오답입니다... ${pyeong}평 × 3.3 = ${correctSqm}㎡`;
    } else {
      const sqm = parseFloat(question.prompt.split('㎡')[0]);
      const correctPyeong = (sqm / PYEONG_TO_SQM_RATIO).toFixed(2);
      return `▶ 오답입니다... ${sqm}㎡ ÷ 3.3 = ${correctPyeong}평`;
    }
  }
}
