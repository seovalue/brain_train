import type { Question, Difficulty } from '../../types';
import { SeededRNG } from '../rng';
import { formatNumber } from '../format';

const PYEONG_TO_SQM_RATIO = 3.3;

/**
 * 평수 변환 문제 생성
 */
export function generateAreaQuestions(
  seed: string, 
  difficulty: Difficulty,
  precision: number = 0
): Question[] {
  const rng = new SeededRNG(seed);
  const questions: Question[] = [];

  for (let i = 0; i < 10; i++) {
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
        format: { decimals: precision }
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
        format: { decimals: precision }
      });
    }
  }

  return questions;
}

/**
 * 난이도에 따른 평수 생성
 */
function generatePyeongAmount(rng: SeededRNG, difficulty: Difficulty): number {
  switch (difficulty) {
    case "easy":
      // 1~20 정수
      return rng.nextInt(1, 20);
    case "medium":
      // 5~50, 소수점 1자리
      return Number((rng.nextInt(5, 50) + rng.next()).toFixed(1));
    case "hard":
      // 1~100, 랜덤 소수
      return Number((rng.nextInt(1, 100) + rng.next()).toFixed(2));
    default:
      return 10;
  }
}

/**
 * 난이도에 따른 제곱미터 생성
 */
function generateSqmAmount(rng: SeededRNG, difficulty: Difficulty): number {
  switch (difficulty) {
    case "easy":
      // 3~66 (1~20평에 해당)
      return rng.nextInt(3, 66);
    case "medium":
      // 16~165 (5~50평에 해당), 소수점 1자리
      return Number((rng.nextInt(16, 165) + rng.next()).toFixed(1));
    case "hard":
      // 3~330 (1~100평에 해당), 랜덤 소수
      return Number((rng.nextInt(3, 330) + rng.next()).toFixed(2));
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
