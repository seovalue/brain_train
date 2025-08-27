import type { Question, Difficulty } from '../../types';
import { SeededRNG } from '../rng';

/**
 * 달러 암산 문제 생성
 */
export function generateDollarQuestions(
  seed: string, 
  exchangeRate: number, 
  difficulty: Difficulty,
  questionCount: 3 | 5 | 7 | 10 = 10
): Question[] {
  const rng = new SeededRNG(seed);
  const questions: Question[] = [];

  for (let i = 0; i < questionCount; i++) {
    const dollarAmount = generateDollarAmount(rng, difficulty);
    const answer = Math.round(dollarAmount * exchangeRate);

    questions.push({
      id: `${seed}_dollar_${i}`,
      type: "USD_TO_KRW",
      prompt: `$${dollarAmount} = ?원`,
      icon: "💵",
      answer,
      format: { thousand: true }
    });
  }

  return questions;
}

/**
 * 난이도에 따른 달러 금액 생성
 */
function generateDollarAmount(rng: SeededRNG, difficulty: Difficulty): number {
  switch (difficulty) {
    case "easy":
      // 10~100, 10의 배수 (계산하기 쉬운 값들)
      return rng.pick([10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
    case "medium":
      // 20~400, 10단위
      return rng.pick([20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 310, 320, 330, 340, 350, 360, 370, 380, 390, 400]);
    case "hard":
      // 50~1000, 랜덤
      return rng.nextInt(50, 1000);
    default:
      return 100;
  }
}

/**
 * 달러 문제의 계산 근거 생성
 */
export function generateDollarRationale(dollarAmount: number, exchangeRate: number, userAnswer: number): string {
  const correctAnswer = Math.round(dollarAmount * exchangeRate);
  const isCorrect = Math.abs(userAnswer - correctAnswer) < 1;
  
  if (isCorrect) {
    return `▶ 정답입니다! ${dollarAmount} × ${exchangeRate.toLocaleString()} = ${correctAnswer.toLocaleString()}`;
  } else {
    return `▶ 오답입니다... ${dollarAmount} × ${exchangeRate.toLocaleString()} = ${correctAnswer.toLocaleString()}`;
  }
}
