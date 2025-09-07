import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConsoleWindow } from '../components/ConsoleWindow';
import { ProgressBar } from '../components/ProgressBar';
import { FeedbackBadge } from '../components/FeedbackBadge';
import { useSettingsStore } from '../stores/settings';
import { useDailyQuizStore } from '../stores/dailyQuiz';
import { generateNumberSequenceQuestions } from '../lib/quiz/numberSequence';
import { useSEO } from '../lib/seo/useSEO';

const GAME_TIME_LIMIT = 2000; // 2초 게임 시간

export const GameNumberSequence: React.FC = () => {
  const navigate = useNavigate();
  useSEO({
    title: '숫자 순서 누르기 - 작업기억 훈련',
    description: '1부터 목표 숫자까지 순서대로 빠르게 누르는 작업기억/집중력 게임.',
    robots: 'index,follow',
  });
  const { questionCount, difficulty } = useSettingsStore();
  const { 
    currentQuestionIndex, 
    currentQuestion, 
    questions,
    startQuiz,
    submitAnswer,
    nextQuestion,
    finishQuiz
  } = useDailyQuizStore();

  // 게임 상태
  const [gameState, setGameState] = useState<'ready' | 'countdown' | 'playing' | 'feedback'>('ready');
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME_LIMIT);
  const [clickedNumbers, setClickedNumbers] = useState<number[]>([]);
  const [clickedButtonIndex, setClickedButtonIndex] = useState<number | null>(null);
  const [isGameEnded, setIsGameEnded] = useState(false); // 게임 종료 플래그 추가
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [completionTimes, setCompletionTimes] = useState<number[]>([]); // 각 문제별 완료 시간 저장
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sequenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gameStartTimeRef = useRef<number>(0);
  const isGameEndedRef = useRef<boolean>(false);

  // 게임 초기화
  useEffect(() => {
    console.log('GameNumberSequence: 초기화 시작', { questions: questions.length, currentQuestion });
    
    if (questions.length === 0) {
      console.log('GameNumberSequence: 새로운 퀴즈 생성');
      const newSeed = `${new Date().toISOString().split('T')[0]}-${difficulty}`;
      const newQuestions = generateNumberSequenceQuestions(newSeed, questionCount, difficulty);
      console.log('GameNumberSequence: 생성된 문제들', newQuestions);
      startQuiz(newQuestions, 'numberSequence');
    } else if (currentQuestion) {
      console.log('GameNumberSequence: 기존 퀴즈 로드', currentQuestion);
    }
  }, [questions.length, questionCount, difficulty, startQuiz, currentQuestion]);

  // 현재 문제 변경 시 상태 리셋 - Phase 1-2: 상태 리셋 로직 개선
  useEffect(() => {
    if (currentQuestion) {
      console.log('GameNumberSequence: 문제 변경', { currentQuestionIndex, currentQuestion });
      
      // 기존 타이머 정리
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (sequenceTimerRef.current) {
        clearTimeout(sequenceTimerRef.current);
        sequenceTimerRef.current = null;
      }
      
      // 상태 초기화
      setIsGameEnded(false);
      isGameEndedRef.current = false;
      setTimeLeft(GAME_TIME_LIMIT);
      setClickedNumbers([]);
      setClickedButtonIndex(null);
      setShowFeedback(false);
      // completionTimes는 리셋하지 않음 (전체 게임 동안 유지)
      
      // 첫 번째 문제가 아니면 바로 countdown으로 시작
      if (currentQuestionIndex > 0) {
        setGameState('countdown');
        setCountdown(3);
        // 약간의 지연 후 카운트다운 시작 (상태 업데이트 완료 후)
        setTimeout(() => {
          startCountdown();
        }, 100);
      } else {
        setGameState('ready');
      }
    }
  }, [currentQuestionIndex, currentQuestion]);

  // 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current);
    };
  }, []);

  // 게임 타이머 시작
  const startGameTimer = () => {
    console.log('GameNumberSequence: 타이머 시작');
    gameStartTimeRef.current = Date.now();
    
    const updateTimer = () => {
      // isGameEndedRef를 사용하여 클로저 문제 해결
      if (isGameEndedRef.current) {
        console.log('GameNumberSequence: 타이머 중단 - isGameEnded');
        return;
      }
      
      const elapsed = Date.now() - gameStartTimeRef.current;
      const remaining = Math.max(0, GAME_TIME_LIMIT - elapsed);
      
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        console.log('GameNumberSequence: 시간 초과');
        // 시간 초과 시 최대 시간으로 기록
        setCompletionTimes(prev => [...prev, GAME_TIME_LIMIT / 1000]);
        handleGameEnd(false, '▶ 시간 초과입니다...');
      } else {
        timerRef.current = setTimeout(updateTimer, 100);
      }
    };
    
    updateTimer();
  };

  // 카운트다운 시작
  const startCountdown = () => {
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setGameState('playing');
          startGameTimer();
          return 3;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 게임 시작 - Phase 1-1: 게임 순서 로직 수정
  const startGame = () => {
    setGameState('countdown');
    setCountdown(3);
    startCountdown();
  };

  // 숫자 클릭 처리
  const handleNumberClick = (number: number, buttonIndex: number) => {
    if (gameState !== 'playing' || clickedNumbers.includes(number) || isGameEnded) return;

    console.log('GameNumberSequence: 숫자 클릭', { number, buttonIndex, clickedNumbers });

    // 클릭 피드백 표시
    setClickedButtonIndex(buttonIndex);
    setTimeout(() => setClickedButtonIndex(null), 150);

    const expectedNumber = clickedNumbers.length + 1;
    const newClickedNumbers = [...clickedNumbers, number];

    if (number === expectedNumber) {
      setClickedNumbers(newClickedNumbers);
      
      // 시퀀스 완료 확인
      if (newClickedNumbers.length === (currentQuestion?.numberSequence?.length || 0)) {
        const reactionTime = Date.now() - gameStartTimeRef.current;
        
        // 시간 초과 체크 (3초를 넘었으면 실패 처리)
        if (reactionTime > GAME_TIME_LIMIT) {
          console.log('GameNumberSequence: 시간 초과로 실패', { reactionTime });
          handleGameEnd(false, '▶ 시간 초과입니다...');
        } else {
          const reactionTimeInSeconds = (reactionTime / 1000).toFixed(2);
          console.log('GameNumberSequence: 시퀀스 완료', { reactionTime });
          // 완료 시간을 저장
          setCompletionTimes(prev => [...prev, reactionTime / 1000]);
          handleGameEnd(true, `▶ 정답입니다! (${reactionTimeInSeconds}s)`);
        }
      }
    } else {
      console.log('GameNumberSequence: 순서 틀림', { number, expectedNumber });
      // 틀렸을 때는 최대 시간(2초)으로 기록
      setCompletionTimes(prev => [...prev, GAME_TIME_LIMIT / 1000]);
      handleGameEnd(false, '▶ 순서가 틀렸습니다...');
    }
  };

  // 다음 문제로 이동
  const handleNextQuestion = (isCorrect: boolean) => {
    const answer = isCorrect ? (currentQuestion?.numberSequence?.length || 0) : 0;
    
    console.log('GameNumberSequence: 다음 문제로 이동', { isCorrect, answer });
    
    submitAnswer(answer, isCorrect);

    if (currentQuestionIndex + 1 >= questions.length) {
      // 마지막 문제인 경우 결과 페이지로 이동
      console.log('GameNumberSequence: 게임 완료, 결과 페이지로 이동');
      const result = finishQuiz();
      
      // 평균 소요 시간 계산
      const avgTime = completionTimes.length > 0 
        ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
        : 0;
      
      navigate('/result', { 
        state: { 
          result: {
            ...result,
            averageReactionTime: avgTime,
            reactionTimes: completionTimes
          },
          gameType: 'numberSequence'
        } 
      });
    } else {
      nextQuestion();
    }
  };

  // 게임 종료 처리 - Phase 2-1: 타이머 정리 로직 강화
  const handleGameEnd = (success: boolean, message: string) => {
    console.log('GameNumberSequence: 게임 종료', { success, message, isGameEnded });
    
    // Phase 2-3: 중복 피드백 방지
    if (isGameEnded || showFeedback) {
      return;
    }
    
    // 즉시 모든 타이머 정리
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (sequenceTimerRef.current) {
      clearTimeout(sequenceTimerRef.current);
      sequenceTimerRef.current = null;
    }
    
    // 게임 종료 플래그 설정
    setIsGameEnded(true);
    isGameEndedRef.current = true;
    setGameState('feedback');
    
    // 피드백 표시
    setFeedbackMessage(message);
    setShowFeedback(true);
    
    // 2초 후 다음 문제로 이동
    setTimeout(() => {
      setShowFeedback(false);
      handleNextQuestion(success);
    }, 2000);
  };

  // 로딩 상태 체크
  if (questions.length === 0 || currentQuestionIndex >= questions.length || !currentQuestion) {
    console.log('GameNumberSequence: 로딩 상태', { 
      questionsLength: questions.length, 
      currentQuestionIndex, 
      currentQuestion: !!currentQuestion 
    });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">🧠</div>
          <div className="text-sm">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 bg-console-bg border-b-2 border-console-fg" style={{paddingTop: '10px', paddingBottom: '10px'}}>
        <button
          onClick={() => navigate('/')}
          className="pixel-button text-sm px-3 py-2"
        >
          ← 홈으로
        </button>
        <div className="text-sm">
          문제 {currentQuestionIndex + 1}/{questions.length}
        </div>
      </div>

      {/* 진행률 바 */}
      <ProgressBar current={currentQuestionIndex + 1} total={questions.length} className="p-4" />

      {/* 게임 영역 */}
      <div className="flex-1 flex flex-col justify-center items-center p-4">
        <ConsoleWindow className="w-full max-w-[400px] min-h-[550px] flex flex-col relative">
          {/* 타이머 영역 - 상단 고정 */}
          {gameState === 'playing' && (
            <div className="text-center p-4 border-b-2 border-console-fg">
              <div className="text-2xl mb-2">{currentQuestion.icon}</div>
              <div className="text-3xl font-bold text-console-accent" style={{fontSize: '32px'}}>
                {Math.ceil(timeLeft / 1000)}초
              </div>
            </div>
          )}

          <div className="text-center flex-1 flex flex-col justify-center">
               
            {/* 준비 상태 */}
            {gameState === 'ready' && (
              <>
                <div className="text-sm whitespace-pre-line mb-4">
                  {currentQuestion.prompt}
                </div>
                <button
                  onClick={startGame}
                  className="pixel-button px-6 py-3 text-lg"
                  style={{margin: '1rem'}}
                >
                  시작하기
                </button>
              </>
            )}

            {/* 카운트다운 */}
            {gameState === 'countdown' && (
              <div className="text-center">
                <div className="text-4xl font-bold text-console-accent mb-4">
                  {countdown}
                </div>
                <div className="text-sm">준비하세요!</div>
              </div>
            )}

            {/* 게임 플레이 */}
            {gameState === 'playing' && (
              <div className="grid grid-cols-5 gap-2 w-full max-w-[320px] mx-auto">
                  {Array.from({ length: 25 }, (_, index) => {
                    const x = index % 5;
                    const y = Math.floor(index / 5);
                    const position = currentQuestion.numberPositions?.find(pos => pos.x === x && pos.y === y);
                    const number = position ? currentQuestion.numberSequence?.[currentQuestion.numberPositions?.indexOf(position) || 0] : null;
                    const isClicked = number ? clickedNumbers.includes(number) : false;

                    return (
                      <button
                        key={index}
                        onClick={() => number && handleNumberClick(number, index)}
                        disabled={!number || isClicked || isGameEnded}
                        className="w-12 h-12 rounded-full border-3 font-pixel text-lg transition-all aspect-square"
                        style={{
                          fontFamily: '"Press Start 2P", monospace',
                          textShadow: '2px 2px 0px rgba(0,0,0,0.5)',
                          backgroundColor: number ? (isClicked ? '#88FF88' : '#2D3748') : 'transparent',
                          borderColor: number ? (isClicked ? '#4A5568' : '#4A5568') : 'transparent',
                          color: number ? (isClicked ? '#000000' : '#FFFFFF') : 'transparent',
                          transform: clickedButtonIndex === index ? 'scale(0.95)' : 'scale(1)',
                          transition: 'transform 0.1s ease-in-out'
                        }}
                      >
                        {number || ''}
                      </button>
                    );
                  })}
                </div>
            )}
          </div>

          {/* 피드백 - ConsoleWindow 내부에서 중앙 배치 */}
          {showFeedback && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}>
              <FeedbackBadge
                isCorrect={feedbackMessage.includes('정답')}
                message={feedbackMessage}
                className="text-lg px-8 py-6"
              />
            </div>
          )}
        </ConsoleWindow>
      </div>
    </div>
  );
};
