import type { Question, Difficulty } from '../../types';
import { SeededRNG } from '../rng';

export function generateVerificationCodeQuestion(
  index: number,
  _seed: string,
  _difficulty: Difficulty
): Question {
  // 완전 랜덤 인증번호 생성 (시드 대신 현재 시간 사용)
  const timestamp = Date.now();
  const randomSeed = `${timestamp}-${Math.random()}-${index}`;
  const rng = new SeededRNG(randomSeed);
  
  // 6자리 인증번호 생성
  const code = rng.nextInt(100000, 999999); // 100000 ~ 999999
  
  return {
    id: `verification-${timestamp}-${index}`,
    type: 'VERIFICATION_CODE',
    prompt: `[Web발신]\n[두뇌수련] 인증번호 [${code}]\n *타인에게 절대 알리지 마세요.`,
    icon: '📱',
    answer: code,
    format: {
      thousand: false
    }
  };
}

export function generateVerificationCodeQuestions(
  count: number,
  seed: string,
  difficulty: Difficulty
): Question[] {
  return Array.from({ length: count }, (_, index) =>
    generateVerificationCodeQuestion(index, seed, difficulty)
  );
}
