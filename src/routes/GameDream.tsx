import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConsoleWindow } from '../components/ConsoleWindow';

import { Keypad } from '../components/Keypad';
import { ProgressBar } from '../components/ProgressBar';
import { FeedbackBadge } from '../components/FeedbackBadge';
import { useDailyQuizStore } from '../stores/dailyQuiz';
import { useSettingsStore } from '../stores/settings';
import { generateDreamGrandfatherQuestions } from '../lib/quiz/dream';
import { generateSeed, getTodayString } from '../lib/rng';

export const GameDream: React.FC = () => {
  const navigate = useNavigate();
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

  const [inputValues, setInputValues] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'wrong'>('correct');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showNumbers, setShowNumbers] = useState(true);
  const [canInput, setCanInput] = useState(false);
  const [currentDisplayIndex, setCurrentDisplayIndex] = useState(0);


  // 게임 초기화
  useEffect(() => {
    const today = getTodayString();
    const newSeed = generateSeed(today, difficulty);
    const generatedQuestions = generateDreamGrandfatherQuestions(
      questionCount,
      newSeed,
      difficulty
    );
    startQuiz(generatedQuestions, 'dream');
  }, [questionCount, difficulty, startQuiz]);

  // 숫자들을 순차적으로 표시하는 효과
  useEffect(() => {
    if (currentQuestion) {
      setShowNumbers(true);
      setCanInput(false);
      setInputValues([]);
      setCurrentNumberInput('');
      setShowFeedback(false);
      setCurrentDisplayIndex(0);
      
      // 각 숫자를 0.8초씩 표시
      const displayTimer = setTimeout(() => {
        setShowNumbers(false);
        setCanInput(true);
      }, 4800); // 6개 숫자 × 0.8초 = 4.8초

      return () => clearTimeout(displayTimer);
    }
  }, [currentQuestion]);

  // 순차적 표시를 위한 타이머
  useEffect(() => {
    if (showNumbers && currentQuestion) {
      const timer = setTimeout(() => {
        if (currentDisplayIndex < 5) {
          setCurrentDisplayIndex(prev => prev + 1);
        }
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [showNumbers, currentDisplayIndex, currentQuestion]);

  // 현재까지 표시된 프롬프트 생성
  const getCurrentPrompt = (prompt: string) => {
    if (!showNumbers) {
      return '꿈에서 할아버지가 나에게 숫자 6개를 알려주셨다..\n\n할아버지가 알려준 숫자가 뭐였더라?';
    }
    
    const lines = prompt.split('\n');
    const numberLines = lines.filter(line => line.match(/^\d+\.\.\.$/));
    
    // 현재 표시할 숫자만 보이도록
    if (currentDisplayIndex < 6) {
      const currentNumber = numberLines[currentDisplayIndex]; // 현재 숫자
      return `꿈에서 할아버지가 나에게 숫자 6개를 알려주셨다..\n\n${currentNumber}\n\n할아버지가 알려준 숫자가 뭐였더라?`;
    }
    
    return prompt;
  };

  const [currentNumberInput, setCurrentNumberInput] = useState('');

  const handleKeypadInput = useCallback((value: string) => {
    if (!canInput) return;
    
    if (value === 'C') {
      setCurrentNumberInput('');
    } else if (value === 'OK') {
      // 현재 입력된 숫자를 배열에 추가
      if (currentNumberInput && inputValues.length < 6) {
        const num = parseInt(currentNumberInput);
        if (num >= 1 && num <= 45) {
          const newInputValues = [...inputValues, num];
          setInputValues(newInputValues);
          setCurrentNumberInput('');
          
          // 6개 숫자를 모두 입력했으면 자동 제출
          if (newInputValues.length === 6) {
            // newInputValues를 직접 사용하여 제출
            setTimeout(() => {
              // 순서가 달라도 정답으로 인식하도록 정렬하여 비교
              const sortedUserInput = [...newInputValues].sort((a, b) => a - b);
              const sortedOriginalNumbers = [...(currentQuestion?.originalNumbers || [])].sort((a, b) => a - b);
              const isCorrect = JSON.stringify(sortedUserInput) === JSON.stringify(sortedOriginalNumbers);
              
              if (isCorrect) {
                setFeedbackType('correct');
                setFeedbackMessage('▶ 정답입니다!');
              } else {
                setFeedbackType('wrong');
                setFeedbackMessage(`▶ 오답입니다... 정답: ${currentQuestion?.originalNumbers?.join(', ') || ''}`);
              }
              
              // userAnswer는 6자리 숫자로 계산 (순서 고려)
              const userAnswer = parseInt(newInputValues.join(''));
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
            }, 100);
          }
        }
      }
    } else {
      // 숫자 입력
      if (currentNumberInput.length < 2) {
        const newInput = currentNumberInput + value;
        const num = parseInt(newInput);
        
        // 45를 넘는 숫자 입력 시 alert 표시
        if (num > 45) {
          alert('1~45 사이의 숫자만 입력 가능합니다!');
          return;
        }
        
        setCurrentNumberInput(newInput);
      }
    }
  }, [currentNumberInput, inputValues, canInput]);



  if (!currentQuestion) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-2" style={{paddingBottom: '20px'}}>
      <div className="w-full max-w-[335px] h-[680px] flex flex-col">
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
          
          {/* 꿈 할아버지 게임 안내 */}
          <div className="mb-2 p-2 bg-console-accent/10 border border-console-accent/20 rounded text-center">
            <span className="text-xs text-console-accent">
              👴 할아버지의 숫자를 기억하세요!
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
            
            {/* 숫자 표시 영역 */}
            <div className="mb-4">
              <div className="text-sm text-console-fg/70 mb-2">
                {showNumbers ? '할아버지가 알려주시는 숫자를 기억하세요!' : '기억한 6자리 숫자를 입력하세요'}
              </div>
              
              <div className="bg-console-bg border-2 border-console-fg p-3 rounded mb-3">
                <pre className="text-xs font-mono text-console-fg whitespace-pre-line">
                  {getCurrentPrompt(currentQuestion.prompt)}
                </pre>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-console-fg/70 mb-2">
                입력된 숫자: {inputValues.length}/6
              </div>
              <div className="bg-console-bg border-2 border-console-fg p-2 rounded text-center mb-2">
                <div className="text-[12px] font-mono text-console-fg leading-tight">
                  {inputValues.length > 0 ? inputValues.join(', ') : ''}
                </div>
              </div>
              {inputValues.length < 6 && (
                <div className="text-sm text-console-fg/70">
                  현재 입력: {currentNumberInput || '_'}
                </div>
              )}
            </div>
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
            submitDisabled={!canInput || showFeedback}
          />
        </div>
      </div>
    </div>
  );
};
