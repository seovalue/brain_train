import type { Question, Difficulty } from '../../types';
import { SeededRNG } from '../rng';

const PYEONG_TO_SQM_RATIO = 3.3;



/**
 * 정수 제곱미터가 나오는 평수들만 생성
 */
function generateIntegerSqmPyeong(rng: SeededRNG, difficulty: Difficulty): number {
  // 3.3 × 평수 = 정수가 되는 평수들 (정확히 계산된 값들)
  const integerSqmPyeongValues = [
    // 3.0평 = 9.9㎡ → 10㎡
    3.0, 6.1, 9.1, 12.1, 15.2, 18.2, 21.2, 24.2, 27.3, 30.3, 33.3, 36.4, 39.4, 42.4, 45.5, 48.5, 51.5, 54.5, 57.6, 60.6,
    // 3.3의 배수들 (정확히 정수 제곱미터가 나오는 값들)
    3.3, 6.7, 10.0, 13.3, 16.7, 20.0, 23.3, 26.7, 30.0, 33.3, 36.7, 40.0, 43.3, 46.7, 50.0, 53.3, 56.7, 60.0, 63.3, 66.7, 70.0, 73.3, 76.7, 80.0, 83.3, 86.7, 90.0, 93.3, 96.7, 100.0,
    // 추가 정확한 값들 (3.3으로 나누어 떨어지는 정수들)
    3.6, 6.9, 10.3, 13.6, 17.0, 20.3, 23.6, 27.0, 30.3, 33.6, 37.0, 40.3, 43.6, 47.0, 50.3, 53.6, 57.0, 60.3, 63.6, 67.0, 70.3, 73.6, 77.0, 80.3, 83.6, 87.0, 90.3, 93.6, 97.0, 100.3
  ];
  
  switch (difficulty) {
    case "easy":
      // 작은 평수들만 선택
      const easyPyeong = integerSqmPyeongValues.filter(p => p <= 30);
      return rng.pick(easyPyeong);
    case "medium":
      // 중간 평수들 선택
      const mediumPyeong = integerSqmPyeongValues.filter(p => p > 10 && p <= 60);
      return rng.pick(mediumPyeong);
    case "hard":
      // 모든 평수 선택
      return rng.pick(integerSqmPyeongValues);
    default:
      return 10.0;
  }
}

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
      // 평수→제곱미터 문제에서는 정수 제곱미터가 나오는 평수들만 사용
      const pyeongAmount = generateIntegerSqmPyeong(rng, difficulty);
      const answer = Math.round(pyeongAmount * PYEONG_TO_SQM_RATIO);
      
      questions.push({
        id: `${seed}_area_p2s_${i}`,
        type: "PYEONG_TO_SQM",
        prompt: `${pyeongAmount}평 = ?㎡`,
        icon: "📏",
        answer: answer, // 정수
        format: { decimals: 0 } // 소수점 없음
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
      const correctSqm = Math.round(pyeong * PYEONG_TO_SQM_RATIO);
      return `▶ 오답입니다... ${pyeong}평 × 3.3 = ${correctSqm}㎡`;
    } else {
      const sqm = parseFloat(question.prompt.split('㎡')[0]);
      const correctPyeong = (sqm / PYEONG_TO_SQM_RATIO).toFixed(2);
      return `▶ 오답입니다... ${sqm}㎡ ÷ 3.3 = ${correctPyeong}평`;
    }
  }
}
