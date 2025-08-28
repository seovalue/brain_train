import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConsoleWindow } from '../components/ConsoleWindow';
import { ProgressBar } from '../components/ProgressBar';
import { FeedbackBadge } from '../components/FeedbackBadge';
import { useDailyQuizStore } from '../stores/dailyQuiz';
import { useSettingsStore } from '../stores/settings';
import { generateRPSQuestion, numberToUserChoice, getRPSResultMessage } from '../lib/quiz/rps';
import type { RockPaperScissors, Question } from '../types';

const RPS_ICONS = {
  rock: "✊",
  paper: "✋", 
  scissors: "✌️"
};

const RPS_NAMES = {
  rock: "바위",
  paper: "보",
  scissors: "가위"
};

export default function GameRPS() {
  const navigate = useNavigate();
  const { 
    seed, 
    currentQuestionIndex, 
    questions, 
    currentQuestion: storeCurrentQuestion,
    startQuiz, 
    submitAnswer, 
    nextQuestion, 
    finishQuiz 
  } = useDailyQuizStore();
  const { questionCount } = useSettingsStore();
  
  const [currentQuestionData, setCurrentQuestionData] = useState<Question | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<RockPaperScissors | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);
  const [isAnswered, setIsAnswered] = useState(false);

  // 게임 시작 시 문제 생성
  useEffect(() => {
    if (questions.length === 0) {
      const rpsQuestions = Array.from({ length: questionCount }, (_, i) => 
        generateRPSQuestion(seed, i)
      );
      startQuiz(rpsQuestions, 'rps');
    }
  }, [seed, questionCount, questions.length, startQuiz]);

  // 현재 문제 데이터 설정
  useEffect(() => {
    if (storeCurrentQuestion) {
      setCurrentQuestionData(storeCurrentQuestion);
    }
  }, [storeCurrentQuestion]);

  // 문제 변경 시 상태 초기화
  useEffect(() => {
    setSelectedChoice(null);
    setShowFeedback(false);
    setFeedbackMessage("");
    setIsCorrect(false);
    setTimeLeft(5);
    setIsAnswered(false);
  }, [currentQuestionIndex]);

  const handleAnswer = useCallback((choice: RockPaperScissors | null) => {
    if (isAnswered || !currentQuestionData) return;
    
    setIsAnswered(true);
    const userChoice = choice || selectedChoice;
    
    if (!userChoice) {
      // 시간 초과로 답하지 않은 경우
      setFeedbackMessage("▶ 시간 초과입니다...");
      setIsCorrect(false);
      setShowFeedback(true);
      submitAnswer(-1, false); // -1은 오답을 의미
      
      setTimeout(() => {
        if (currentQuestionIndex < questionCount - 1) {
          nextQuestion();
        } else {
          const result = finishQuiz();
          navigate('/result', { state: { result, gameType: 'rps' } });
        }
      }, 2000);
      return;
    }

    const isAnswerCorrect = userChoice === numberToUserChoice(currentQuestionData.answer);
    const message = getRPSResultMessage(
      currentQuestionData.systemChoice!,
      userChoice,
      currentQuestionData.rpsPrompt!
    );

    setFeedbackMessage(message);
    setIsCorrect(isAnswerCorrect);
    setShowFeedback(true);

    submitAnswer(userChoiceToNumber(userChoice), isAnswerCorrect);

    setTimeout(() => {
      if (currentQuestionIndex < questionCount - 1) {
        nextQuestion();
      } else {
        const result = finishQuiz();
        navigate('/result', { state: { result, gameType: 'rps' } });
      }
    }, 2000);
  }, [currentQuestionIndex, currentQuestionData, selectedChoice, isAnswered, questionCount, navigate, submitAnswer, nextQuestion, finishQuiz]);

  const handleChoiceSelect = useCallback((choice: RockPaperScissors) => {
    if (isAnswered) return;
    setSelectedChoice(choice);
    // 선택 시 즉시 제출
    handleAnswer(choice);
  }, [isAnswered, handleAnswer]);

  // 타이머 효과
  useEffect(() => {
    if (isAnswered) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // 시간 초과 시 자동으로 오답 처리
          clearInterval(timer);
          handleAnswer(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAnswered, handleAnswer]);

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isAnswered) return;
      
      switch (e.key) {
        case '1':
        case 'q':
        case 'Q':
          handleChoiceSelect('rock');
          break;
        case '2':
        case 'w':
        case 'W':
          handleChoiceSelect('paper');
          break;
        case '3':
        case 'e':
        case 'E':
          handleChoiceSelect('scissors');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleChoiceSelect, isAnswered]);

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
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">문제 {currentQuestionIndex + 1}/{questionCount}</span>
          </div>
          
          <ProgressBar current={currentQuestionIndex + 1} total={questionCount} />
        </div>

        {/* 타이머 */}
        <div className="mb-4 text-center flex-shrink-0">
          <div className="text-3xl font-pixel text-[#FF5555] mb-2">
            {timeLeft}초
          </div>
          <div className="w-full bg-[#2A2A3A] h-3 rounded">
            <div 
              className="bg-[#FF5555] h-3 rounded transition-all duration-1000"
              style={{ width: `${(timeLeft / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* 게임 영역 */}
        <ConsoleWindow className="mb-4 flex-grow flex flex-col justify-center">
          {currentQuestionData && (
            <>
              {/* 시스템 선택 표시 */}
              <div className="mb-8 text-center">
                <div className="text-[8rem] mb-4">
                  {RPS_ICONS[currentQuestionData.systemChoice!]}
                </div>
              </div>

                {/* 프롬프트 */}
                <div className="mb-10 text-center">
                  <div className="text-[1.2rem] font-pixel text-[#5599FF] mb-2 tracking-wider leading-tight">
                    <p className="font-bold text-shadow-pixel">{currentQuestionData.rpsPrompt}!</p>
                  </div>
                </div>

              {/* 선택 옵션 */}
              <div className="mb-6">
                <div className="grid grid-cols-3 gap-4">
                  {(['rock', 'paper', 'scissors'] as RockPaperScissors[]).map((choice) => (
                    <button
                      key={choice}
                      onClick={() => handleChoiceSelect(choice)}
                      disabled={isAnswered}
                      className={`
                        p-6 rounded border-2 font-pixel transition-all
                        ${selectedChoice === choice 
                          ? 'border-[#88FF88] bg-[#2A3A2A] text-[#88FF88]' 
                          : 'border-[#3A3A4A] bg-[#2A2A3A] hover:border-[#5599FF]'
                        }
                        ${isAnswered ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <div className="text-[2rem] mb-2">{RPS_ICONS[choice]}</div>
                      <div className="text-base text-[#E0E0E0]">{RPS_NAMES[choice]}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </ConsoleWindow>

        {/* 피드백 */}
        {showFeedback && (
          <FeedbackBadge 
            message={feedbackMessage}
            isCorrect={isCorrect}
            className="mb-2 flex-shrink-0"
          />
        )}
      </div>
    </div>
  );
}

// 숫자 변환 함수들
function userChoiceToNumber(choice: RockPaperScissors): number {
  const choiceMap = { rock: 0, paper: 1, scissors: 2 };
  return choiceMap[choice];
}
