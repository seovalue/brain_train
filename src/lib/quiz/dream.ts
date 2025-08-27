import type { Question, Difficulty } from '../../types';
import { SeededRNG } from '../rng';

export function generateDreamGrandfatherQuestion(
  index: number,
  _seed: string,
  _difficulty: Difficulty
): Question {
  // 매번 다른 숫자가 나오도록 현재 시간을 시드로 사용
  const timestamp = Date.now();
  const randomSeed = `${timestamp}-${Math.random()}-${index}`;
  const rng = new SeededRNG(randomSeed);
  
  // 1~45 사이의 랜덤한 숫자 6개 생성
  const numbers: number[] = [];
  while (numbers.length < 6) {
    const num = rng.nextInt(1, 45);
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  
  // answer는 더 이상 사용되지 않음 (순서 무관 정답 확인으로 변경됨)
  
  // 프롬프트 생성 - 덮어쓰기 효과를 위한 형식
  const prompt = `꿈에서 할아버지가 나에게 숫자 6개를 알려주셨다..

${numbers[0]}...
${numbers[1]}...
${numbers[2]}...
${numbers[3]}...
${numbers[4]}...
${numbers[5]}...

할아버지가 알려준 숫자가 뭐였더라?`;
  
  return {
    id: `dream-grandfather-${timestamp}-${index}`,
    type: 'DREAM_GRANDFATHER',
    prompt,
    icon: '👴',
    answer: 0, // 더 이상 사용되지 않지만 타입 호환성을 위해 0으로 설정
    originalNumbers: numbers, // 원본 숫자 배열 저장
    format: {
      thousand: false
    }
  };
}

export function generateDreamGrandfatherQuestions(
  count: number,
  seed: string,
  difficulty: Difficulty
): Question[] {
  return Array.from({ length: count }, (_, index) =>
    generateDreamGrandfatherQuestion(index, seed, difficulty)
  );
}
