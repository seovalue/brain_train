import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConsoleWindow } from '../components/ConsoleWindow';
import { NumberInput } from '../components/NumberInput';
import { Keypad } from '../components/Keypad';
import { ProgressBar } from '../components/ProgressBar';
import { FeedbackBadge } from '../components/FeedbackBadge';
import { useDailyQuizStore } from '../stores/dailyQuiz';
import { useSettingsStore } from '../stores/settings';
import { generateVerificationCodeQuestions } from '../lib/quiz/verification';
import { formatNumber } from '../lib/format';
import { generateSeed, getTodayString } from '../lib/rng';
import { useSEO } from '../lib/seo/useSEO';

export const GameVerification: React.FC = () => {
  const navigate = useNavigate();
  useSEO({
    title: '인증번호 외우기 - 6자리 기억력',
    description: '짧게 제시된 6자리 인증번호를 기억해 입력하는 집중력/단기기억 훈련 게임.',
    robots: 'index,follow',
  });
  const { questionCount, difficulty } = useSettingsStore();
  const { 
    currentQuestionIndex, 
    score, 
    currentQuestion,
    startQuiz,
    submitAnswer,
    nextQuestion,
    finishQuiz
  } = useDailyQuizStore();

  const [inputValue, setInputValue] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'wrong'>('correct');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showCode, setShowCode] = useState(true);
  const [canInput, setCanInput] = useState(false);

  // 게임 초기화 - verification은 매번 새로운 인증번호 생성
  useEffect(() => {
    // verification 게임은 매번 새로운 퀴즈 생성
    const today = getTodayString();
    const newSeed = generateSeed(today, difficulty);
    const generatedQuestions = generateVerificationCodeQuestions(
      questionCount,
      newSeed,
      difficulty
    );
    startQuiz(generatedQuestions, 'verification');
  }, [questionCount, difficulty, startQuiz]);

  // 현재 문제

  // 인증번호 표시 후 1.5초 뒤 숨기기
  useEffect(() => {
    if (currentQuestion) {
      setShowCode(true);
      setCanInput(false);
      setInputValue('');
      setShowFeedback(false);
      
      const timer = setTimeout(() => {
        setShowCode(false);
        setCanInput(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [currentQuestion]);

  // 인증번호만 숨긴 prompt 생성
  const getHiddenPrompt = (prompt: string) => {
    return prompt.replace(/\[(\d{6})\]/g, '[******]');
  };

  const handleKeypadInput = useCallback((value: string) => {
    if (!canInput) return; // 인증번호가 보이는 동안 입력 금지
    
    if (value === 'C') {
      setInputValue('');
    } else if (value === 'OK') {
      handleSubmit();
    } else {
      if (inputValue.length < 6) {
        setInputValue(prev => prev + value);
      }
    }
  }, [inputValue, canInput]);

  const handleSubmit = useCallback(() => {
    if (!currentQuestion || !canInput) return;

    const userAnswer = parseInt(inputValue);
    const isCorrect = userAnswer === currentQuestion.answer;

    if (isCorrect) {
      setFeedbackType('correct');
      setFeedbackMessage('▶ 정답입니다!');
    } else {
      setFeedbackType('wrong');
      setFeedbackMessage(`▶ 오답입니다... 정답: ${formatNumber(currentQuestion.answer)}`);
    }

    submitAnswer(userAnswer, isCorrect);
    setShowFeedback(true);

    // 다음 문제로 이동
    setTimeout(() => {
      if (currentQuestionIndex + 1 < questionCount) {
        nextQuestion();
      } else {
        // 게임 종료
        const result = finishQuiz();
        navigate('/result', { state: { result } });
      }
    }, 1500);
  }, [currentQuestion, inputValue, canInput, currentQuestionIndex, questionCount, submitAnswer, nextQuestion, finishQuiz, navigate]);

  if (!currentQuestion) {
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
          
          {/* 인증번호 게임 안내 */}
          <div className="mb-2 p-2 bg-console-accent/10 border border-console-accent/20 rounded text-center">
            <span className="text-xs text-console-accent">
              📱 6자리 인증번호를 기억하세요!
            </span>
          </div>
          
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
            <div className="text-2xl mb-2">{currentQuestion.icon}</div>
            
            {/* 인증번호 표시 영역 */}
            <div className="mb-4">
              <div className="text-sm text-console-fg/70 mb-2">
                {showCode ? '인증번호를 기억하세요!' : '기억한 인증번호를 입력하세요'}
              </div>
              
              <div className="bg-console-bg border-2 border-console-fg p-3 rounded mb-3">
                <pre className="text-xs font-mono text-console-fg whitespace-pre-line">
                  {showCode ? currentQuestion.prompt : getHiddenPrompt(currentQuestion.prompt)}
                </pre>
              </div>
            </div>
            
            <NumberInput
              value={inputValue}
              onChange={setInputValue}
              placeholder="6자리 숫자 입력"
              disabled={!canInput || showFeedback}
              maxLength={6}
            />
          </div>
        </ConsoleWindow>

        {/* 피드백 */}
        {showFeedback && (
          <FeedbackBadge
            isCorrect={feedbackType === 'correct'}
            message={feedbackMessage}
            className="mb-2 flex-shrink-0"
          />
        )}

        <p></p>
        {/* 키패드 */}
        <div className="flex-shrink-0">
          <Keypad
            onNumberClick={(num) => handleKeypadInput(num.toString())}
            onClear={() => handleKeypadInput('C')}
            onSubmit={() => handleKeypadInput('OK')}
            submitDisabled={!canInput || showFeedback || inputValue.length !== 6}
          />
        </div>
      </div>
    </div>
  );
};
