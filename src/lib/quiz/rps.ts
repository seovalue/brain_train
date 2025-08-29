import { SeededRNG } from '../rng';
import type { RockPaperScissors, RPSPrompt, RPSBurningPrompt, Question } from '../../types';

// 타이머 설정 (밀리초 단위)
export const RPS_TIMEOUT_MS = 3000; // 3초
export const RPS_BURNING_TIMEOUT_MS = 1500; // 1.5초

const RPS_PROMPTS: RPSPrompt[] = [
  "이기지도 비기지도 말아주세요",
  "비기지도 말고\n지지도 말아주세요",
  "이기지도 지지도 말아주세요"
];

const RPS_BURNING_PROMPTS: RPSBurningPrompt[] = [
  // 기존 프롬프트들
  "이기지도 비기지도 말아주세요",
  "비기지도 말고\n지지도 말아주세요",
  "이기지도 지지도 말아주세요",
  // 초고난이도 프롬프트들
  "이기거나 지세요",
  "아무것도 누르지 마세요",
  "지거나 비기세요",
  "이기거나 비기세요"
];

const RPS_CHOICES: RockPaperScissors[] = ["rock", "paper", "scissors"];

// 가위바위보 승패 판정 함수
export function getRPSResult(system: RockPaperScissors, user: RockPaperScissors): "win" | "lose" | "draw" {
  if (system === user) return "draw";
  
  if (
    (system === "rock" && user === "paper") ||
    (system === "paper" && user === "scissors") ||
    (system === "scissors" && user === "rock")
  ) {
    return "win";
  }
  
  return "lose";
}

// 프롬프트에 따른 정답 계산
export function getCorrectAnswer(system: RockPaperScissors, prompt: RPSPrompt): RockPaperScissors {
  switch (prompt) {
    case "이기지도 비기지도 말아주세요":
      // 이기지도 비기지도 말라는 것은 지라는 뜻
      return getLosingChoice(system);
      
    case "비기지도 말고\n지지도 말아주세요":
      // 비기지도 말고 지지도 말라는 것은 이기라는 뜻
      return getWinningChoice(system);
      
    case "이기지도 지지도 말아주세요":
      // 이기지도 지지도 말라는 것은 비기라는 뜻
      return system;
      
    default:
      return system;
  }
}

// 초고난이도 프롬프트에 따른 정답 계산
export function getBurningCorrectAnswer(system: RockPaperScissors, prompt: RPSBurningPrompt): RockPaperScissors | null {
  switch (prompt) {
    // 기존 프롬프트들
    case "이기지도 비기지도 말아주세요":
      // 이기지도 비기지도 말라는 것은 지라는 뜻
      return getLosingChoice(system);
      
    case "비기지도 말고\n지지도 말아주세요":
      // 비기지도 말고 지지도 말라는 것은 이기라는 뜻
      return getWinningChoice(system);
      
    case "이기지도 지지도 말아주세요":
      // 이기지도 지지도 말라는 것은 비기라는 뜻
      return system;
      
    // 초고난이도 프롬프트들
    case "이기거나 지세요":
      // 이기거나 지면 성공 (비기면 안됨)
      return getWinningChoice(system) || getLosingChoice(system);
      
    case "아무것도 누르지 마세요":
      // 아무것도 누르지 않으면 성공 (null 반환)
      return null;
      
    case "지거나 비기세요":
      // 지거나 비기면 성공 (이기면 안됨)
      return getLosingChoice(system) || system;
      
    case "이기거나 비기세요":
      // 이기거나 비기면 성공 (지면 안됨)
      return getWinningChoice(system) || system;
      
    default:
      return system;
  }
}

// 초고난이도 프롬프트에 따른 모든 가능한 정답 반환
export function getBurningAllCorrectAnswers(system: RockPaperScissors, prompt: RPSBurningPrompt): (RockPaperScissors | null)[] {
  switch (prompt) {
    // 기존 프롬프트들 (단일 답안)
    case "이기지도 비기지도 말아주세요":
      return [getLosingChoice(system)];
      
    case "비기지도 말고\n지지도 말아주세요":
      return [getWinningChoice(system)];
      
    case "이기지도 지지도 말아주세요":
      return [system];
      
    // 초고난이도 프롬프트들
    case "이기거나 지세요":
      // 이기거나 지면 성공 (비기면 안됨)
      return [getWinningChoice(system), getLosingChoice(system)];
      
    case "아무것도 누르지 마세요":
      // 아무것도 누르지 않으면 성공
      return [null];
      
    case "지거나 비기세요":
      // 지거나 비기면 성공 (이기면 안됨)
      return [getLosingChoice(system), system];
      
    case "이기거나 비기세요":
      // 이기거나 비기면 성공 (지면 안됨)
      return [getWinningChoice(system), system];
      
    default:
      return [system];
  }
}

function getWinningChoice(system: RockPaperScissors): RockPaperScissors {
  switch (system) {
    case "rock": return "paper";
    case "paper": return "scissors";
    case "scissors": return "rock";
  }
}

function getLosingChoice(system: RockPaperScissors): RockPaperScissors {
  switch (system) {
    case "rock": return "scissors";
    case "paper": return "rock";
    case "scissors": return "paper";
  }
}

// 가위바위보 문제 생성
export function generateRPSQuestion(seed: string, index: number, previousPrompt?: RPSPrompt): Question {
  const rng = new SeededRNG(seed + "-rps-" + index);
  
  const systemChoice = rng.pick(RPS_CHOICES);
  
  // 이전 프롬프트와 다른 프롬프트 선택
  let availablePrompts = RPS_PROMPTS;
  if (previousPrompt && RPS_PROMPTS.length > 1) {
    availablePrompts = RPS_PROMPTS.filter(p => p !== previousPrompt);
  }
  
  const prompt = rng.pick(availablePrompts);
  const correctAnswer = getCorrectAnswer(systemChoice, prompt);
  
  // 정답을 숫자로 변환 (0: rock, 1: paper, 2: scissors)
  const answerMap = { rock: 0, paper: 1, scissors: 2 };
  
  return {
    id: `rps-${seed}-${index}`,
    type: "ROCK_PAPER_SCISSORS",
    prompt,
    systemChoice,
    rpsPrompt: prompt,
    answer: answerMap[correctAnswer],
    timeLimit: RPS_TIMEOUT_MS, // 2초
    icon: "✊" // 기본 아이콘
  };
}

// 초고난이도 가위바위보 문제 생성
export function generateRPSBurningQuestion(seed: string, index: number, previousPrompt?: RPSBurningPrompt): Question {
  const rng = new SeededRNG(seed + "-rps-burning-" + index);
  
  const systemChoice = rng.pick(RPS_CHOICES);
  
  // 이전 프롬프트와 다른 프롬프트 선택
  let availablePrompts = RPS_BURNING_PROMPTS;
  if (previousPrompt && RPS_BURNING_PROMPTS.length > 1) {
    availablePrompts = RPS_BURNING_PROMPTS.filter(p => p !== previousPrompt);
  }
  
  const burningPrompt = rng.pick(availablePrompts);
  const allCorrectAnswers = getBurningAllCorrectAnswers(systemChoice, burningPrompt);
  
  // 정답을 숫자로 변환 (0: rock, 1: paper, 2: scissors, -1: 아무것도 누르지 않음)
  const answerMap = { rock: 0, paper: 1, scissors: 2 };
  const multipleAnswers = allCorrectAnswers.map((answer: RockPaperScissors | null) => 
    answer === null ? -1 : answerMap[answer]
  );
  
  // 첫 번째 답안을 기본 answer로 설정 (하위 호환성)
  const answer = multipleAnswers[0];
  
  return {
    id: `rps-burning-${seed}-${index}`,
    type: "ROCK_PAPER_SCISSORS",
    prompt: burningPrompt, // prompt 필드에 burningPrompt 설정
    systemChoice,
    rpsBurningPrompt: burningPrompt,
    answer,
    multipleAnswers, // 여러 답안 설정
    timeLimit: RPS_BURNING_TIMEOUT_MS, // 1.5초
    icon: "🔥", // 불 아이콘
    isBurningMode: true
  };
}

// 사용자 선택을 숫자로 변환
export function userChoiceToNumber(choice: RockPaperScissors): number {
  const choiceMap = { rock: 0, paper: 1, scissors: 2 };
  return choiceMap[choice];
}

// 숫자를 사용자 선택으로 변환
export function numberToUserChoice(num: number): RockPaperScissors {
  const choiceMap: Record<number, RockPaperScissors> = { 0: "rock", 1: "paper", 2: "scissors" };
  return choiceMap[num] || "rock";
}

// 결과 메시지 생성
export function getRPSResultMessage(system: RockPaperScissors, user: RockPaperScissors, prompt: RPSPrompt): string {
  const correctAnswer = getCorrectAnswer(system, prompt);
  
  if (user === correctAnswer) {
    return "▶ 정답입니다!";
  } else {
    const choiceNames = { rock: "바위", paper: "보", scissors: "가위" };
    return `▶ 오답입니다... 정답은 ${choiceNames[correctAnswer]}입니다.`;
  }
}

// 초고난이도 결과 메시지 생성
export function getRPSBurningResultMessage(system: RockPaperScissors, user: RockPaperScissors | null, prompt: RPSBurningPrompt): string {
  const allCorrectAnswers = getBurningAllCorrectAnswers(system, prompt);
  
  // 사용자 답안이 정답 중 하나인지 확인
  const isCorrect = allCorrectAnswers.includes(user);
  
  if (isCorrect) {
    return "▶ 정답입니다!";
  } else {
    if (allCorrectAnswers.includes(null)) {
      return "▶ 오답입니다... 아무것도 누르지 않아야 했습니다.";
    } else {
      const choiceNames = { rock: "바위", paper: "보", scissors: "가위" };
      const correctAnswerNames = allCorrectAnswers
        .filter(answer => answer !== null)
        .map(answer => choiceNames[answer as RockPaperScissors])
        .join(" 또는 ");
      return `▶ 오답입니다... 정답은 ${correctAnswerNames}입니다.`;
    }
  }
}
