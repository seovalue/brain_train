export type Difficulty = "easy" | "medium" | "hard";

export type QuestionType = "USD_TO_KRW" | "PYEONG_TO_SQM" | "SQM_TO_PYEONG" | "VERIFICATION_CODE";

export type Question = {
  id: string;
  type: QuestionType;
  prompt: string;
  icon?: string;
  answer: number;
  format?: { 
    decimals?: number; 
    thousand?: boolean;
  };
};

export type GameResult = {
  date: string;
  difficulty: Difficulty;
  total: number;
  correct: number;
  ms?: number;
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
