import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConsoleWindow } from '../components/ConsoleWindow';
import { NumberInput } from '../components/NumberInput';
import { Keypad } from '../components/Keypad';
import { ProgressBar } from '../components/ProgressBar';
import { FeedbackBadge } from '../components/FeedbackBadge';
import { useSettingsStore } from '../stores/settings';
import { useDailyQuizStore } from '../stores/dailyQuiz';
import { generateAreaQuestions, generateAreaRationale } from '../lib/quiz/area';
import { generateSeed, getTodayString } from '../lib/rng';
import { parseNumber } from '../lib/format';
import type { Difficulty } from '../types';

/**
 * 평수 변환 문제의 허용 오차 범위 계산
 */
function getAreaTolerance(answer: number, difficulty: Difficulty): number {
  // 정답이 정수인 경우
  if (Number.isInteger(answer)) {
    return 1; // ±1 허용
  }
  
  // 정답이 소수점인 경우
  const decimalPlaces = answer.toString().split('.')[1]?.length || 0;
  
  switch (difficulty) {
    case "easy":
      return 2; // 쉬운 난이도는 ±2 허용 (소수점 입력 불필요)
    case "medium":
      return decimalPlaces >= 1 ? 0.5 : 1; // 소수점 1자리 이상이면 ±0.5, 아니면 ±1
    case "hard":
      return decimalPlaces >= 2 ? 0.3 : 0.5; // 소수점 2자리 이상이면 ±0.3, 아니면 ±0.5
    default:
      return 1;
  }
}

export const GameArea: React.FC = () => {
  const navigate = useNavigate();
  const { difficulty, questionCount } = useSettingsStore();
  const { 
    questions, 
    currentQuestionIndex, 
    score,
    gameType,
    startQuiz, 
    submitAnswer, 
    nextQuestion, 
    finishQuiz 
  } = useDailyQuizStore();

  const [inputValue, setInputValue] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);

  // 게임 시작
  useEffect(() => {
    if (questions.length === 0 || gameType !== 'area') {
      const today = getTodayString();
      const seed = generateSeed(today, difficulty);
      const newQuestions = generateAreaQuestions(seed, difficulty, 1, questionCount); // 기본값 1자리 소수점
      startQuiz(newQuestions, 'area');
    }
  }, [questions.length, gameType, difficulty, questionCount, startQuiz]);

  const currentQ = questions[currentQuestionIndex];

  const handleNumberClick = (num: number) => {
    if (showFeedback) return;
    setInputValue(prev => prev + num.toString());
  };

  const handleClear = () => {
    if (showFeedback) return;
    setInputValue('');
  };

  const handleSubmit = () => {
    if (showFeedback || !inputValue || !currentQ) return;
    
    const userAnswer = parseNumber(inputValue);
    
    // 근사값 허용 범위 계산
    const tolerance = getAreaTolerance(currentQ.answer, difficulty);
    const correct = Math.abs(userAnswer - currentQ.answer) <= tolerance;
    
    // 답안 제출
    submitAnswer(userAnswer);
    
    // 피드백 표시
    const message = generateAreaRationale(currentQ, userAnswer, tolerance);
    
    setFeedbackMessage(message);
    setIsCorrect(correct);
    setShowFeedback(true);
    
    // 2초 후 다음 문제로
    setTimeout(() => {
      setShowFeedback(false);
      setInputValue('');
      
      if (currentQuestionIndex < questionCount - 1) {
        nextQuestion();
      } else {
        // 게임 종료
        const result = finishQuiz();
        navigate('/result', { state: { result } });
      }
    }, 2000);
  };

  if (!currentQ) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-2">
      <div className="w-full max-w-[335px] h-[680px] flex flex-col">
        {/* 헤더 */}
        <div className="mb-2 flex-shrink-0">
          <button
            className="pixel-button mb-2 text-xs"
            onClick={() => navigate('/')}
          >
            ← 홈으로
          </button>
          <p></p>
          <p></p>
          
          {/* 기준값 표시 */}
          <div className="mb-2 p-2 bg-console-accent/10 border border-console-accent/20 rounded text-center">
            <span className="text-xs text-console-accent">
              1평 = 3.3㎡
            </span>
          </div>
          
          {/* 쉬운 난이도 가이드 */}
          {difficulty === "easy" && (
            <div className="mb-2 p-2 bg-console-green/10 border border-console-green/20 rounded text-center">
              <span className="text-xs text-console-green">
                💡 정수만 입력해도 돼요.
              </span>
            </div>
          )}
          <p></p>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">문제 {currentQuestionIndex + 1}/{questionCount}</span>
            <span className="text-xs">점수: {score}</span>
          </div>
          
          <ProgressBar current={currentQuestionIndex + 1} total={questionCount} />
        </div>

        {/* 문제 */}
        <ConsoleWindow className="mb-2 flex-shrink-0">
          <div className="text-center p-3">
            <div className="text-2xl mb-2">{currentQ.icon}</div>
            <h2 className="text-base font-bold mb-3">{currentQ.prompt}</h2>
            
            <NumberInput
              value={inputValue}
              onChange={setInputValue}
              format={currentQ.format}
              placeholder="답을 입력하세요"
              disabled={showFeedback}
            />
          </div>
        </ConsoleWindow>

        {/* 피드백 */}
        {showFeedback && (
          <FeedbackBadge
            isCorrect={isCorrect}
            message={feedbackMessage}
            className="mb-2 flex-shrink-0"
          />
        )}

        <p></p>
        {/* 키패드 */}
        <div className="flex-shrink-0">
          <Keypad
            onNumberClick={handleNumberClick}
            onClear={handleClear}
            onSubmit={handleSubmit}
            submitDisabled={!inputValue || showFeedback}
          />
        </div>
      </div>
    </div>
  );
};
