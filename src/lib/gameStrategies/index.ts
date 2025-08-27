import type { Question, GameResult } from '../../types';

// 게임 전략 인터페이스
export interface GameStrategy {
  initializeGame(questions: Question[]): void;
  submitAnswer(answer: number, isCorrect?: boolean): void;
  calculateResult(totalQuestions: number, totalTime: number): GameResult;
  getGameData(): any;
}

// 기본 게임 전략 (일반 퀴즈용)
export class DefaultGameStrategy implements GameStrategy {
  private answers: (number | null)[] = [];
  private score: number = 0;
  private questions: Question[] = [];
  private currentQuestionIndex: number = 0;

  initializeGame(questions: Question[]): void {
    this.questions = questions;
    this.answers = new Array(questions.length).fill(null);
    this.score = 0;
    this.currentQuestionIndex = 0;
  }

  submitAnswer(answer: number, isCorrect?: boolean): void {
    if (this.currentQuestionIndex >= this.questions.length) return;

    this.answers[this.currentQuestionIndex] = answer;
    
    // isCorrect가 제공되지 않은 경우 문제의 정답과 비교
    let correct: boolean;
    if (isCorrect !== undefined) {
      correct = isCorrect;
    } else {
      const question = this.questions[this.currentQuestionIndex];
      correct = Math.abs(answer - question.answer) < 0.01;
    }
    
    if (correct) {
      this.score++;
    }
    
    this.currentQuestionIndex++;
  }

  calculateResult(totalQuestions: number, totalTime: number): GameResult {
    return {
      date: new Date().toISOString().split('T')[0],
      difficulty: 'medium',
      total: totalQuestions,
      correct: this.score,
      ms: totalTime,
    };
  }

  getGameData(): any {
    return {
      answers: this.answers,
      score: this.score,
    };
  }
}

// 반응속도 게임 전략
export class ReactionGameStrategy implements GameStrategy {
  private reactionTimes: number[] = [];

  initializeGame(_questions: Question[]): void {
    this.reactionTimes = [];
  }

  submitAnswer(answer: number, _isCorrect?: boolean): void {
    // 반응속도 게임에서는 answer가 반응시간
    this.reactionTimes.push(answer);
  }

  calculateResult(totalQuestions: number, totalTime: number): GameResult {
    const averageReactionTime = this.reactionTimes.length > 0
      ? this.reactionTimes.reduce((sum, time) => sum + time, 0) / this.reactionTimes.length
      : 0;

    return {
      date: new Date().toISOString().split('T')[0],
      difficulty: 'medium',
      total: totalQuestions,
      correct: this.reactionTimes.length, // 완료한 문제 수
      ms: totalTime,
      reactionTimes: this.reactionTimes,
      averageReactionTime,
    };
  }

  getGameData(): any {
    return {
      reactionTimes: this.reactionTimes,
    };
  }
}

// 게임 전략 팩토리
export class GameStrategyFactory {
  private static strategies: Record<string, new () => GameStrategy> = {
    'default': DefaultGameStrategy,
    'reaction': ReactionGameStrategy,
    'dollar': DefaultGameStrategy,
    'area': DefaultGameStrategy,
    'dream': DefaultGameStrategy,
    'verification': DefaultGameStrategy,
  };

  static createStrategy(gameType: string): GameStrategy {
    const StrategyClass = this.strategies[gameType] || DefaultGameStrategy;
    return new StrategyClass();
  }

  static registerStrategy(gameType: string, strategyClass: new () => GameStrategy): void {
    this.strategies[gameType] = strategyClass;
  }
}
