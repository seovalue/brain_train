import type { Question } from '../../types';

export const generateReactionQuestions = (
  count: number,
  _seed: number,
  _difficulty: 'easy' | 'medium' | 'hard'
): Question[] => {
  const questions: Question[] = [];

  for (let i = 0; i < count; i++) {
    questions.push({
      id: `reaction_${i}`,
      type: 'REACTION_TIME',
      prompt: '',
      icon: '⚡',
      answer: 0, // 반응속도 게임에서는 answer가 의미없음
      format: { decimals: 3, thousand: false }  
    });
  }

  return questions;
};
