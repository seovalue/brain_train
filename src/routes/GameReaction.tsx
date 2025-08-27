import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConsoleWindow } from '../components/ConsoleWindow';
import { ProgressBar } from '../components/ProgressBar';
import { FeedbackBadge } from '../components/FeedbackBadge';
import { useDailyQuizStore } from '../stores/dailyQuiz';
import { useSettingsStore } from '../stores/settings';
import { generateReactionQuestions } from '../lib/quiz/reaction';
import { generateSeed, getTodayString } from '../lib/rng';

export const GameReaction: React.FC = () => {
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

  const [gameState, setGameState] = useState<'intro' | 'countdown' | 'waiting' | 'ready' | 'clicked' | 'feedback'>('intro');
  const [countdown, setCountdown] = useState(3);
  const [reactionTime, setReactionTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // 게임 초기화
  useEffect(() => {
    const today = getTodayString();
    const newSeed = generateSeed(today, difficulty);
    const generatedQuestions = generateReactionQuestions(
      questionCount,
      newSeed.length, // string을 number로 변환
      difficulty
    );
    startQuiz(generatedQuestions, 'reaction');
  }, [questionCount, difficulty, startQuiz]);

  // 카운트다운 시작
  useEffect(() => {
    if (currentQuestion && gameState === 'countdown') {
      setCountdown(3);
      
      const countdownTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            // 랜덤 지연 시간 (0.5~1.5초)
            const delay = Math.random() * 1000 + 500;
            setTimeout(() => {
              setGameState('ready');
              setStartTime(Date.now());
            }, delay);
            return 1; // 0 대신 1을 반환하여 0이 표시되지 않도록 함
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownTimer);
    }
  }, [currentQuestion, gameState]);

  // 버튼 클릭 핸들러
  const handleButtonClick = useCallback(() => {
    if (gameState === 'ready') {
      // 즉시 상태를 변경하여 버튼을 숨김
      setGameState('feedback');
      
      const endTime = Date.now();
      const time = (endTime - startTime) / 1000; // 초 단위로 변환
      
      setReactionTime(time);
      
      // 피드백 메시지 생성
      let message = '';
      if (time < 0.1) {
        message = '▶ 유전자 검사 가능할듯';
      } else if (time < 0.2) {
        message = '▶ 좀 더 훈련 필요';
      } else if (time < 0.4) {
        message = '▶ 유전자의 유 자도 못 봄';
      } else if (time < 1.0) {
        message = '▶ 애매한 실력';
      } else {
        message = '▶ 그냥 돈주고 사세요';
      }
      
      setFeedbackMessage(`${message}\n${time.toFixed(3)}초 걸렸습니다.`);
      setShowFeedback(true);
      
      // 정답 제출 (반응속도 게임에서는 시간이 점수)
      submitAnswer(time, true);
      
      // 다음 문제로 이동
      setTimeout(() => {
        if (currentQuestionIndex + 1 < questionCount) {
          nextQuestion();
          setGameState('countdown'); // intro 대신 countdown으로 바로 시작
          setShowFeedback(false);
        } else {
          // 게임 종료
          const result = finishQuiz();
          navigate('/result', { state: { result, gameType: 'reaction' } });
        }
      }, 2000);
    }
  }, [gameState, startTime, currentQuestionIndex, questionCount, submitAnswer, nextQuestion, finishQuiz, navigate]);

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
          
          {/* 반응속도 게임 안내 */}
          <div className="mb-2 p-2 bg-console-accent/10 border border-console-accent/20 rounded text-center">
            <span className="text-xs text-console-accent">
              ⚡ 반응속도를 테스트해보세요!
            </span>
          </div>
          
          <p></p>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">문제 {currentQuestionIndex + 1}/{questionCount}</span>
            <span className="text-xs">점수: {score}</span>
          </div>
          
          <ProgressBar current={currentQuestionIndex + 1} total={questionCount} />
        </div>

        {/* 게임 영역 */}
        <ConsoleWindow className="mb-2 flex-shrink-0 flex-1">
          <div className="text-center p-3 h-full flex flex-col justify-center">
            <div className="mb-4" style={{ fontSize: '2rem' }}>{currentQuestion.icon}</div>
            
            {/* 게임 안내 */}
            {gameState === 'intro' && (
              <div className="mb-4">
                <div className="text-sm text-console-fg/70 mb-4 font-bold whitespace-pre-line">
                  3, 2, 1...{'\n'}클릭 버튼이 나타나면{'\n'}빠르게 클릭하세요!
                </div>
                <p></p>
                <button
                  className="pixel-button px-6 py-3 text-sm"
                  onClick={() => setGameState('countdown')}
                >
                  시작하기
                </button>
              </div>
            )}
            
            {/* 카운트다운 */}
            {gameState === 'countdown' && (
              <div className="mb-4">
                <div className="text-6xl font-mono text-console-accent">
                  {countdown}
                </div>
              </div>
            )}
            
            {/* 대기 상태 */}
            {gameState === 'waiting' && (
              <div className="mb-4">
                <div className="text-2xl text-console-fg/50">
                  ⏳
                </div>
              </div>
            )}
            
            {/* 클릭 버튼 */}
            {gameState === 'ready' && (
              <div className="mb-4">
                <button
                  className="pixel-button bg-console-accent text-console-bg font-bold shadow-lg"
                  style={{ width: '160px', height: '160px', fontSize: '1.5rem' }}
                  onClick={handleButtonClick}
                  disabled={gameState !== 'ready'}
                >
                  CLICK!
                </button>
              </div>
            )}
            
            {/* 클릭 후 결과 */}
            {gameState === 'clicked' && (
              <div className="mb-4">
                <div className="text-sm text-console-fg/70 mb-2">
                  반응속도 측정 완료!
                </div>
                <div className="text-2xl font-mono text-console-accent">
                  {reactionTime.toFixed(3)}초
                </div>
              </div>
            )}
          </div>
        </ConsoleWindow>

        {/* 피드백 */}
        {showFeedback && (
          <FeedbackBadge
            isCorrect={true}
            message={feedbackMessage}
            className="mb-2 flex-shrink-0"
          />
        )}

        <p></p>
      </div>
    </div>
  );
};
