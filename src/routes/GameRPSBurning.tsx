import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConsoleWindow } from '../components/ConsoleWindow';
import { ProgressBar } from '../components/ProgressBar';
import { FeedbackBadge } from '../components/FeedbackBadge';
import { useDailyQuizStore } from '../stores/dailyQuiz';
import { generateRPSBurningQuestion, numberToUserChoice, getRPSBurningResultMessage, RPS_BURNING_TIMEOUT_MS } from '../lib/quiz/rps';
import type { RockPaperScissors, Question, RPSBurningPrompt } from '../types';

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
const TIMEOUT_SECONDS = RPS_BURNING_TIMEOUT_MS / 1000;
// 초고난이도 모드는 5문제 고정
const BURNING_QUESTION_COUNT = 5;

export default function GameRPSBurning() {
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
    console.log('GameRPSBurning 마운트 - 현재 questions 길이:', questions.length);
    console.log('현재 gameType:', useDailyQuizStore.getState().gameType);
    
    // 이전 게임 상태 정리
    resetQuiz();
    
    // 새로운 문제 생성
    let previousPrompt: RPSBurningPrompt | undefined;
    const rpsQuestions = Array.from({ length: BURNING_QUESTION_COUNT }, (_, i) => {
      const question = generateRPSBurningQuestion(seed, i, previousPrompt);
      previousPrompt = question.rpsBurningPrompt;
      return question;
    });
    
    console.log('생성된 문제 개수:', rpsQuestions.length);
    console.log('문제들:', rpsQuestions.map(q => ({ id: q.id, prompt: q.rpsBurningPrompt })));
    
    startQuiz(rpsQuestions, 'rps-burning');
  }, []); // 빈 의존성 배열로 마운트 시에만 실행

  // 현재 문제 데이터 설정
  useEffect(() => {
    if (storeCurrentQuestion) {
      setCurrentQuestionData(storeCurrentQuestion);
      console.log('현재 문제 데이터:', storeCurrentQuestion);
      console.log('프롬프트:', storeCurrentQuestion.rpsBurningPrompt);
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

    // 여러 답안이 가능한 경우 처리
    const multipleAnswers = currentQuestionData.multipleAnswers;
    let isAnswerCorrect = false;
    
    if (multipleAnswers && multipleAnswers.length > 0) {
      // 여러 답안이 있는 경우, 사용자 답안이 정답 중 하나인지 확인
      const userChoiceNumber = userChoiceToNumber(userChoice);
      isAnswerCorrect = multipleAnswers.includes(userChoiceNumber);
    } else {
      // 단일 답안인 경우 기존 로직 사용
      isAnswerCorrect = userChoice === numberToUserChoice(currentQuestionData.answer);
    }

    const message = getRPSBurningResultMessage(
      currentQuestionData.systemChoice!,
      userChoice,
      (currentQuestionData.prompt || currentQuestionData.rpsBurningPrompt) as RPSBurningPrompt
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
      if (currentState.currentQuestionIndex < BURNING_QUESTION_COUNT - 1) {
        nextQuestion();
      } else {
        const result = finishQuiz();
        navigate('/burning-result', { state: { result, gameType: 'rps-burning' } });
      }
      nextQuestionTimeoutRef.current = null;
    }, 2000);
  }, [currentQuestionData, selectedChoice, isAnswered, navigate, submitAnswer, nextQuestion, finishQuiz]);

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
        if (prev <= 0.1) {
          // 시간 초과 시 자동으로 오답 처리
          clearInterval(timer);
          
          // 이미 답변했는지 한 번 더 확인
          if (isAnswered) return 0;
          
          setIsAnswered(true);
          
          // "아무것도 누르지 마세요" 프롬프트인지 확인
          const prompt = currentQuestionData?.prompt || currentQuestionData?.rpsBurningPrompt;
          const isNoActionPrompt = prompt === "아무것도 누르지 마세요";
          
          let isTimeOutCorrect = false;
          let timeOutMessage = "▶ 시간 초과입니다...";
          
          if (isNoActionPrompt) {
            // "아무것도 누르지 마세요" 프롬프트에서는 시간 초과가 정답
            isTimeOutCorrect = true;
            timeOutMessage = "▶ 정답입니다!";
          }
          
          setFeedbackMessage(timeOutMessage);
          setIsCorrect(isTimeOutCorrect);
          setShowFeedback(true);
          submitAnswer(-1, isTimeOutCorrect); // -1은 시간 초과를 의미
          
          // 이전 타이머가 있다면 정리
          if (nextQuestionTimeoutRef.current) {
            clearTimeout(nextQuestionTimeoutRef.current);
          }
          
          nextQuestionTimeoutRef.current = setTimeout(() => {
            // 현재 상태를 직접 가져와서 사용
            const currentState = useDailyQuizStore.getState();
            if (currentState.currentQuestionIndex < BURNING_QUESTION_COUNT - 1) {
              nextQuestion();
            } else {
              const result = finishQuiz();
              navigate('/burning-result', { state: { result, gameType: 'rps-burning' } });
            }
            nextQuestionTimeoutRef.current = null;
          }, 2000);
          
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isAnswered, navigate, submitAnswer, nextQuestion, finishQuiz, currentQuestionData]);

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
            <span className="text-sm">문제 {currentQuestionIndex + 1}/{BURNING_QUESTION_COUNT}</span>
            <span className="text-sm text-[#FF5555] font-bold">🔥 BURNING MODE</span>
          </div>
          
          <ProgressBar current={currentQuestionIndex + 1} total={BURNING_QUESTION_COUNT} />
        </div>

        {/* 타이머 */}
        <div className="mb-4 text-center flex-shrink-0">
          <div className="text-3xl font-pixel text-[#FF5555] mb-2">
            {timeLeft.toFixed(1)}초
          </div>
          <div className="w-full bg-[#2A2A3A] h-3 rounded">
            <div 
              className="bg-[#FF5555] h-3 rounded transition-all duration-100"
              style={{ width: `${(timeLeft / TIMEOUT_SECONDS) * 100}%` }}
            />
          </div>
        </div>

        {/* 게임 영역 */}
        <ConsoleWindow className="mb-4 flex-grow flex flex-col justify-center border-2 border-[#FF5555] bg-[#2A1A1A]">
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
                <div className="text-[1.2rem] font-pixel text-[#FF5555] mb-2 tracking-wider leading-tight">
                  <p 
                    className="font-bold text-shadow-pixel whitespace-pre-line"
                    dangerouslySetInnerHTML={{ 
                      __html: (currentQuestionData.prompt || currentQuestionData.rpsBurningPrompt || '') + '!' 
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
                          ? 'border-[#FF5555] bg-[#3A2A2A] text-[#FF5555]' 
                          : 'border-[#4A3A3A] bg-[#3A2A2A] hover:border-[#FF5555] hover:bg-[#4A3A3A]'
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
