import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConsoleWindow } from '../components/ConsoleWindow';
import { NumberInput } from '../components/NumberInput';
import { Keypad } from '../components/Keypad';
import { ProgressBar } from '../components/ProgressBar';
import { FeedbackBadge } from '../components/FeedbackBadge';
import { useSettingsStore } from '../stores/settings';
import { useDailyQuizStore } from '../stores/dailyQuiz';
import { generateDollarQuestions, generateDollarRationale } from '../lib/quiz/dollar';
import { generateSeed, getTodayString } from '../lib/rng';
import { parseNumber } from '../lib/format';
import { useSEO } from '../lib/seo/useSEO';

export const GameDollar: React.FC = () => {
  const navigate = useNavigate();
  useSEO({
    title: '달러 암산 - 환율 계산 퀴즈',
    description: '설정한 환율로 달러 금액을 원화로 빠르게 암산하세요. 정답 근거와 천 단위 포맷 지원.',
    robots: 'index,follow',
  });
  const { exchangeRate, difficulty, questionCount } = useSettingsStore();
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
    if (questions.length === 0 || gameType !== 'dollar') {
      const today = getTodayString();
      const seed = generateSeed(today, difficulty);
      const newQuestions = generateDollarQuestions(seed, exchangeRate, difficulty, questionCount);
      startQuiz(newQuestions, 'dollar');
    }
  }, [questions.length, gameType, exchangeRate, difficulty, questionCount, startQuiz]);

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
    const correct = Math.abs(userAnswer - currentQ.answer) < 1;
    
    // 답안 제출 (정확도 판정 결과 포함)
    submitAnswer(userAnswer, correct);
    
    // 피드백 표시
    const dollarAmount = parseFloat(currentQ.prompt.split('$')[1].split('=')[0]);
    const message = generateDollarRationale(dollarAmount, exchangeRate, userAnswer);
    
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
      <p></p>
      <p></p>
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
              1달러 = {exchangeRate.toLocaleString()}원
            </span>
          </div>
          
          {/* 쉬운 난이도 가이드 */}
          {difficulty === "easy" && (
            <div className="mb-2 p-2 bg-console-green/10 border border-console-green/20 rounded text-center">
              <span className="text-xs text-console-green">
                💡 자신감을 가져요! 
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
