import type { Question, Difficulty } from '../../types';
import { SeededRNG } from '../rng';

export const generateNumberSequenceQuestions = (
  seed: string,
  _count: number,
  _difficulty: Difficulty
): Question[] => {
  const questions: Question[] = [];
  
  // 항상 5게임으로 고정
  for (let i = 0; i < 5; i++) {
    const questionSeed = `${seed}-${i}`;
    const rng = new SeededRNG(questionSeed);
    
    // 항상 1~5 순서
    const sequence = [1, 2, 3, 4, 5];
    
    // 5x5 그리드에 숫자들을 랜덤 배치
    const positions: Array<{x: number, y: number}> = [];
    const usedPositions = new Set<string>();
    
    for (let j = 0; j < 5; j++) {
      let x: number, y: number, posKey: string;
      
      do {
        x = Math.floor(rng.next() * 5); // 0-4
        y = Math.floor(rng.next() * 5); // 0-4
        posKey = `${x}-${y}`;
      } while (usedPositions.has(posKey));
      
      usedPositions.add(posKey);
      positions.push({ x, y });
    }
    
    const question: Question = {
      id: `number-sequence-${i}`,
      type: 'NUMBER_SEQUENCE',
      prompt: "1부터 5까지\n순서대로 누르세요!",
      icon: '🧠',
      answer: 5, // 모든 숫자를 순서대로 클릭하면 정답
      numberSequence: sequence,
      numberPositions: positions,
      timeLimit: 3000 // 3초 제한
    };
    
    questions.push(question);
  }
  
  return questions;
};
