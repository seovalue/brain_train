import type { Question, Difficulty } from '../../types';
import { SeededRNG, generateDetailedSeed } from '../rng';

/**
 * 중복되지 않는 달러 금액 배열 생성
 */
function generateUniqueDollarAmounts(
  rng: SeededRNG, 
  difficulty: Difficulty, 
  count: number
): number[] {
  const amounts = new Set<number>();
  
  // 충분한 후보 풀 생성 (count의 3배 정도)
  const candidatePool = generateCandidatePool(rng, difficulty, count * 3);
  
  // 중복되지 않는 금액들을 선택
  for (const amount of candidatePool) {
    if (amounts.size >= count) break;
    amounts.add(amount);
  }
  
  // 만약 충분한 수가 없다면 추가 생성
  while (amounts.size < count) {
    const additionalAmount = generateDollarAmount(rng, difficulty);
    amounts.add(additionalAmount);
  }
  
  return Array.from(amounts).slice(0, count);
}

/**
 * 난이도별 후보 풀 생성
 */
function generateCandidatePool(
  rng: SeededRNG, 
  difficulty: Difficulty, 
  poolSize: number
): number[] {
  const candidates: number[] = [];
  
  for (let i = 0; i < poolSize; i++) {
    candidates.push(generateDollarAmount(rng, difficulty));
  }
  
  return candidates;
}

/**
 * 달러 암산 문제 생성
 */
export function generateDollarQuestions(
  seed: string, 
  exchangeRate: number, 
  difficulty: Difficulty,
  questionCount: 3 | 5 | 7 | 10 = 5
): Question[] {
  const questions: Question[] = [];
  
  // 중복되지 않는 달러 금액들을 미리 생성
  const detailedSeed = generateDetailedSeed(seed, difficulty, 0, 'dollar');
  const rng = new SeededRNG(detailedSeed);
  const uniqueAmounts = generateUniqueDollarAmounts(rng, difficulty, questionCount);

  // 생성된 금액들로 문제 생성
  for (let i = 0; i < questionCount; i++) {
    const dollarAmount = uniqueAmounts[i];
    const answer = Math.round(dollarAmount * exchangeRate);

    questions.push({
      id: `${detailedSeed}_dollar_${i}`,
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
      // 10~250, 10의 배수만
      const easyPatterns = [
        // 작은 금액 (10~30)
        () => rng.pick([10, 20, 30]),
        // 중간 금액 (40~80)
        () => rng.pick([40, 50, 60, 70, 80]),
        // 큰 금액 (90~150)
        () => rng.pick([90, 100, 110, 120, 130, 140, 150]),
        // 매우 큰 금액 (160~250)
        () => rng.pick([160, 170, 180, 190, 200, 210, 220, 230, 240, 250])
      ];
      const easyPattern = rng.pick(easyPatterns);
      return easyPattern();
      
    case "medium":
      // 10~600, 더 넓은 범위와 다양한 패턴
      const mediumPatterns = [
        // 작은 금액 (10~120)
        () => rng.nextInt(10, 120),
        // 중간 금액 (125~300)
        () => rng.nextInt(125, 300),
        // 큰 금액 (305~450)
        () => rng.nextInt(305, 450),
        // 매우 큰 금액 (455~600)
        () => rng.nextInt(455, 600),
        // 특별한 값들 (자주 사용되는 금액)
        () => rng.pick([25, 50, 75, 125, 175, 225, 275, 325, 375, 425, 475, 525, 575]),
        // 복합 패턴 (여러 범위에서 랜덤)
        () => {
          const ranges = [[15, 50], [60, 120], [130, 200], [210, 350], [360, 500], [510, 600]];
          const range = rng.pick(ranges);
          return rng.nextInt(range[0], range[1]);
        }
      ];
      const mediumPattern = rng.pick(mediumPatterns);
      return mediumPattern();
      
    case "hard":
      // 15~1500, 매우 다양한 범위
      const hardPatterns = [
        // 작은 금액 (15~250)
        () => rng.nextInt(15, 250),
        // 중간 금액 (255~600)
        () => rng.nextInt(255, 600),
        // 큰 금액 (605~1000)
        () => rng.nextInt(605, 1000),
        // 매우 큰 금액 (1005~1500)
        () => rng.nextInt(1005, 1500),
        // 특별한 값들 (실제 자주 사용되는 금액)
        () => rng.pick([99, 199, 299, 399, 499, 599, 699, 799, 899, 999, 1099, 1199, 1299, 1399, 1499]),
        // 복합 패턴 (여러 범위에서 랜덤)
        () => {
          const ranges = [[20, 100], [110, 300], [310, 500], [510, 800], [810, 1200], [1210, 1500]];
          const range = rng.pick(ranges);
          return rng.nextInt(range[0], range[1]);
        },
        // 소수 패턴 (특별한 소수들)
        () => rng.pick([17, 23, 37, 43, 47, 53, 67, 73, 83, 97, 103, 107, 113, 127, 137, 143, 157, 167, 173, 187, 193, 197, 223, 227, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997, 1009, 1013, 1019, 1021, 1031, 1033, 1039, 1049, 1051, 1061, 1063, 1069, 1087, 1091, 1093, 1097, 1103, 1109, 1117, 1123, 1129, 1151, 1153, 1163, 1171, 1181, 1187, 1193, 1201, 1213, 1217, 1223, 1229, 1231, 1237, 1249, 1259, 1277, 1279, 1283, 1289, 1291, 1297, 1301, 1303, 1307, 1319, 1321, 1327, 1361, 1367, 1373, 1381, 1399, 1409, 1423, 1427, 1429, 1433, 1439, 1447, 1451, 1453, 1459, 1471, 1481, 1483, 1487, 1489, 1493, 1499])
      ];
      const hardPattern = rng.pick(hardPatterns);
      return hardPattern();
      
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
