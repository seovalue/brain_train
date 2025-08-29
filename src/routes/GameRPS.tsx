import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConsoleWindow } from '../components/ConsoleWindow';
import { ProgressBar } from '../components/ProgressBar';
import { FeedbackBadge } from '../components/FeedbackBadge';
import { useDailyQuizStore } from '../stores/dailyQuiz';
import { useSettingsStore } from '../stores/settings';
import { generateRPSQuestion, numberToUserChoice, getRPSResultMessage, RPS_TIMEOUT_MS } from '../lib/quiz/rps';
import type { RockPaperScissors, Question, RPSPrompt } from '../types';

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

// 타임아웃 설정 (초 단위) - 라이브러리에서 가져온 값 사용
const TIMEOUT_SECONDS = RPS_TIMEOUT_MS / 1000;

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
    finishQuiz,
    resetQuiz
  } = useDailyQuizStore();
  const { questionCount } = useSettingsStore();
  
  const [currentQuestionData, setCurrentQuestionData] = useState<Question | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<RockPaperScissors | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMEOUT_SECONDS);
  const [isAnswered, setIsAnswered] = useState(false);
  const nextQuestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 컴포넌트 마운트 시 store 초기화 및 게임 시작
  useEffect(() => {
    console.log('GameRPS 마운트 - 현재 questions 길이:', questions.length);
    console.log('현재 gameType:', useDailyQuizStore.getState().gameType);
    console.log('설정된 questionCount:', questionCount);
    
    // 이전 게임 상태 정리
    resetQuiz();
    
    // 새로운 문제 생성
    let previousPrompt: RPSPrompt | undefined;
    const rpsQuestions = Array.from({ length: questionCount }, (_, i) => {
      const question = generateRPSQuestion(seed, i, previousPrompt);
      previousPrompt = question.rpsPrompt;
      return question;
    });
    
    console.log('생성된 문제 개수:', rpsQuestions.length);
    console.log('문제들:', rpsQuestions.map(q => ({ id: q.id, prompt: q.rpsPrompt })));
    
    startQuiz(rpsQuestions, 'rps');
  }, []); // 빈 의존성 배열로 마운트 시에만 실행

  // 현재 문제 데이터 설정
  useEffect(() => {
    if (storeCurrentQuestion) {
      setCurrentQuestionData(storeCurrentQuestion);
    }
  }, [storeCurrentQuestion]);

  // 문제 변경 시 상태 초기화
  useEffect(() => {
    // 이전 타이머 정리
    if (nextQuestionTimeoutRef.current) {
      clearTimeout(nextQuestionTimeoutRef.current);
      nextQuestionTimeoutRef.current = null;
    }
    
    setSelectedChoice(null);
    setShowFeedback(false);
    setFeedbackMessage("");
    setIsCorrect(false);
    setTimeLeft(TIMEOUT_SECONDS);
    setIsAnswered(false);
  }, [currentQuestionIndex]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (nextQuestionTimeoutRef.current) {
        clearTimeout(nextQuestionTimeoutRef.current);
      }
    };
  }, []);

  const handleAnswer = useCallback((choice: RockPaperScissors | null) => {
    if (!currentQuestionData || isAnswered) return;
    
    const userChoice = choice || selectedChoice;
    
    if (!userChoice) {
      // 시간 초과는 타이머에서 처리하므로 여기서는 아무것도 하지 않음
      return;
    }

    // 이미 답변했음을 표시
    setIsAnswered(true);

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

    // 이전 타이머가 있다면 정리
    if (nextQuestionTimeoutRef.current) {
      clearTimeout(nextQuestionTimeoutRef.current);
    }
    
    nextQuestionTimeoutRef.current = setTimeout(() => {
      // 현재 상태를 직접 가져와서 사용
      const currentState = useDailyQuizStore.getState();
      if (currentState.currentQuestionIndex < questionCount - 1) {
        nextQuestion();
      } else {
        const result = finishQuiz();
        navigate('/result', { state: { result, gameType: 'rps' } });
      }
      nextQuestionTimeoutRef.current = null;
    }, 2000);
  }, [currentQuestionData, selectedChoice, isAnswered, questionCount, navigate, submitAnswer, nextQuestion, finishQuiz]);

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
          
          // 이미 답변했는지 한 번 더 확인
          if (isAnswered) return 0;
          
          setIsAnswered(true);
          
          // 시간 초과 처리 - handleAnswer와 분리
          setFeedbackMessage("▶ 시간 초과입니다...");
          setIsCorrect(false);
          setShowFeedback(true);
          submitAnswer(-1, false); // -1은 오답을 의미
          
          // 이전 타이머가 있다면 정리
          if (nextQuestionTimeoutRef.current) {
            clearTimeout(nextQuestionTimeoutRef.current);
          }
          
          nextQuestionTimeoutRef.current = setTimeout(() => {
            // 현재 상태를 직접 가져와서 사용
            const currentState = useDailyQuizStore.getState();
            if (currentState.currentQuestionIndex < questionCount - 1) {
              nextQuestion();
            } else {
              const result = finishQuiz();
              navigate('/result', { state: { result, gameType: 'rps' } });
            }
            nextQuestionTimeoutRef.current = null;
          }, 2000);
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAnswered, questionCount, navigate, submitAnswer, nextQuestion, finishQuiz]);



  return (
    <div className="min-h-screen flex items-center justify-center p-2">
      <div className="w-full max-w-[335px] h-[600px] flex flex-col">
        {/* 헤더 */}
        <div className="mb-2 flex-shrink-0">
          <button
            className="pixel-button mb-2 text-xs"
            onClick={() => navigate('/')}
            style={{marginBottom: '1rem'}}
          >
            ← 홈으로
          </button>
          
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
              style={{ width: `${(timeLeft / TIMEOUT_SECONDS) * 100}%` }}
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
                    <p 
                      className="font-bold text-shadow-pixel whitespace-pre-line"
                      dangerouslySetInnerHTML={{ 
                        __html: currentQuestionData.rpsPrompt + '!' 
                      }}
                    />
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
