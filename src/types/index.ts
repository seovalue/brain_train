export type Difficulty = "easy" | "medium" | "hard";

export type QuestionType = "USD_TO_KRW" | "PYEONG_TO_SQM" | "SQM_TO_PYEONG" | "VERIFICATION_CODE" | "DREAM_GRANDFATHER" | "REACTION_TIME" | "ROCK_PAPER_SCISSORS" | "NUMBER_SEQUENCE";

export type RockPaperScissors = "rock" | "paper" | "scissors";
export type RPSPrompt = 
  | "이기지도 비기지도 말아주세요"
  | "비기지도 말고\n지지도 말아주세요"
  | "이기지도 지지도 말아주세요";

export type RPSBurningPrompt = 
  | "이기지도 비기지도 말아주세요"
  | "비기지도 말고\n지지도 말아주세요"
  | "이기지도 지지도 말아주세요"
  | "이기거나 지세요"
  | "아무것도 누르지 마세요"
  | "지거나 비기세요"
  | "이기거나 비기세요";

export type Question = {
  id: string;
  type: QuestionType;
  prompt: string;
  icon?: string;
  answer: number;
  multipleAnswers?: number[]; // 여러 답안이 가능한 경우 (초고난이도 가위바위보용)
  originalNumbers?: number[]; // 원본 숫자 배열 (DREAM_GRANDFATHER 타입용)
  format?: { 
    decimals?: number; 
    thousand?: boolean;
  };
  // 가위바위보 게임용 필드들
  systemChoice?: RockPaperScissors;
  rpsPrompt?: RPSPrompt;
  rpsBurningPrompt?: RPSBurningPrompt;
  timeLimit?: number; // 5초 제한시간
  isBurningMode?: boolean; // 초고난이도 모드 여부
  // 숫자 순서 게임용 필드들
  numberSequence?: number[]; // 1~5 순서 배열
  numberPositions?: Array<{x: number, y: number}>; // 각 숫자의 위치
};

export type GameResult = {
  date: string;
  difficulty: Difficulty;
  total: number;
  correct: number;
  ms?: number;
  reactionTimes?: number[]; // 반응속도 게임의 각 문제별 반응시간
  averageReactionTime?: number; // 반응속도 게임의 평균 반응시간
};

export type Settings = {
  exchangeRate: number;
  difficulty: Difficulty;
  uiMode: "grid" | "menu";
  questionCount: 3 | 5 | 7 | 10;
};

export type DailyQuizState = {
  seed: string;
  currentQuestion: number;
  answers: (number | null)[];
  score: number;
  startTime?: number;
  endTime?: number;
};

export type ReleaseNote = {
  version: string;
  date: string;
  title: string;
  changes: Array<{
    type: '✨' | '🐛' | '⚡' | '🎨' | '🎮' | '📱' | '⚙️';
    description: string;
  }>;
  isNew?: boolean;
};
