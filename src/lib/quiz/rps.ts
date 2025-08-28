import { SeededRNG } from '../rng';
import type { RockPaperScissors, RPSPrompt, Question } from '../../types';

const RPS_PROMPTS: RPSPrompt[] = [
  "이기지도 비기지도 말아주세요.",
  "비기지도 말고 지지도 말아주세요",
  "이겨주세요",
  "비겨주세요",
  "져 주세요",
  "이기지도 지지도 말아주세요"
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
    case "이기지도 비기지도 말아주세요.":
      // 이기지도 비기지도 말라는 것은 지라는 뜻
      return getLosingChoice(system);
      
    case "비기지도 말고 지지도 말아주세요":
      // 비기지도 말고 지지도 말라는 것은 이기라는 뜻
      return getWinningChoice(system);
      
    case "이겨주세요":
      return getWinningChoice(system);
      
    case "비겨주세요":
      return system; // 같은 것을 내면 비김
      
    case "져 주세요":
      return getLosingChoice(system);
      
    case "이기지도 지지도 말아주세요":
      // 이기지도 지지도 말라는 것은 비기라는 뜻
      return system;
      
    default:
      return system;
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
export function generateRPSQuestion(seed: string, index: number): Question {
  const rng = new SeededRNG(seed + "-rps-" + index);
  
  const systemChoice = rng.pick(RPS_CHOICES);
  const prompt = rng.pick(RPS_PROMPTS);
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
    timeLimit: 5000, // 5초
    icon: "✊" // 기본 아이콘
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
