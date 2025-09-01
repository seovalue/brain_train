import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConsoleWindow } from '../components/ConsoleWindow';
import { ProgressBar } from '../components/ProgressBar';
import { track } from '@vercel/analytics';

type Lane = 0 | 1 | 2;
type Obstacle = {
  id: string;
  lane: Lane;
  y: number;
  speed: number;
};

export const GameDriving: React.FC = () => {
  const navigate = useNavigate();
  const [playerLane, setPlayerLane] = useState<Lane>(1);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [timeLeft, setTimeLeft] = useState(20);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'success' | 'collision'>('ready');
  const [score, setScore] = useState(0);
  const [dodgedCars, setDodgedCars] = useState(0);
  const gameLoopRef = useRef<number | null>(null);

  // 게임 시작
  const startGame = useCallback(() => {
    track('game_started', {
      gameType: 'driving',
      gameTitle: '픽셀 드라이빙',
    });
    
    setGameState('playing');
    setPlayerLane(1);
    setObstacles([]);
    setTimeLeft(20);
    setScore(0);
    setDodgedCars(0);
  }, []);

  // 게임 루프
  useEffect(() => {
    if (gameState !== 'playing') return;

    // 타이머
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState('success');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 장애물 생성 - 플레이어 위치에 항상 하나 + 추가로 랜덤
    const obstacleGenerator = setInterval(() => {
      setObstacles(prev => {
        // 현재 화면 상단 근처에 장애물이 있는 차선 확인
        const occupiedLanes = prev
          .filter(obs => obs.y < 150)
          .map(obs => obs.lane);
        
        // 사용 가능한 차선 확인
        const availableLanes = [0, 1, 2].filter(
          lane => !occupiedLanes.includes(lane as Lane)
        );
        
        if (availableLanes.length === 0) return prev;
        
        const newObstacles: Obstacle[] = [];
        
        // 플레이어 위치에 장애물 생성 (필수)
        if (availableLanes.includes(playerLane)) {
          newObstacles.push({
            id: `obs-${Date.now()}-player`,
            lane: playerLane,
            y: -80,
            speed: 3 + Math.random() * 2, // 속도: 3-5 px/frame
          });
          // 사용한 차선 제거
          const playerLaneIndex = availableLanes.indexOf(playerLane);
          availableLanes.splice(playerLaneIndex, 1);
        }
        
        // 50% 확률로 추가 장애물 생성
        if (Math.random() < 0.5 && availableLanes.length > 0) {
          const randomLane = availableLanes[
            Math.floor(Math.random() * availableLanes.length)
          ] as Lane;
          
          newObstacles.push({
            id: `obs-${Date.now()}-random`,
            lane: randomLane,
            y: -80,
            speed: 3 + Math.random() * 2, // 속도: 3-5 px/frame
          });
        }
        
        return [...prev, ...newObstacles];
      });
    }, 1500); // 생성 간격을 1000ms에서 1500ms로 증가

    // 게임 업데이트 루프
    const gameLoop = () => {
      setObstacles(prev => {
        const updated = prev
          .map(obs => ({
            ...obs,
            y: obs.y + obs.speed,
          }))
          .filter(obs => {
            if (obs.y > 450) {
              setDodgedCars(c => c + 1);
              return false;
            }
            return true;
          });
        
        return updated;
      });
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      clearInterval(timer);
      clearInterval(obstacleGenerator);
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, playerLane]); // playerLane 의존성 추가

  // 충돌 감지
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    // 플레이어 차량 위치: bottom 70px = Y 380px~440px (height 60px)
    // 장애물 크기: height 70px
    // 충돌 조건: 장애물의 하단(obs.y + 70)이 플레이어 상단(380) 이상이고
    //          장애물의 상단(obs.y)이 플레이어 하단(440) 이하일 때
    const collision = obstacles.some(obs => 
      obs.y + 70 >= 380 && 
      obs.y <= 440 && 
      obs.lane === playerLane
    );
    
    if (collision) {
      setGameState('collision');
    }
  }, [obstacles, playerLane, gameState]);

  // 점수 계산
  useEffect(() => {
    if (gameState === 'playing') {
      const timeScore = (20 - timeLeft) * 10;
      const dodgeScore = dodgedCars * 50;
      setScore(timeScore + dodgeScore);
    }
  }, [timeLeft, dodgedCars, gameState]);

  // 차선 변경
  const changeLane = (direction: 'left' | 'right') => {
    if (gameState !== 'playing') return;
    
    setPlayerLane(prev => {
      if (direction === 'left' && prev > 0) return (prev - 1) as Lane;
      if (direction === 'right' && prev < 2) return (prev + 1) as Lane;
      return prev;
    });
  };

  // 키보드 컨트롤 제거 - 버튼으로만 조작 가능

  const goHome = () => navigate('/');
  
  const restartGame = () => {
    setGameState('ready');
    setPlayerLane(1);
    setObstacles([]);
    setTimeLeft(20);
    setScore(0);
    setDodgedCars(0);
  };

  // 게임 준비 화면
  if (gameState === 'ready') {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center bg-console-bg">
        <ConsoleWindow className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">🚗 픽셀 드라이빙</h2>
          <div className="mb-6 text-console-fg/80">
            <p className="mb-2" style={{ paddingLeft: '10px', paddingRight: '10px' }}>장애물을 피해 20초 동안 생존하세요!</p>
          </div>
          <div className="flex justify-center items-center">
            <button
              onClick={startGame}
              className="pixel-button px-6 py-3 text-lg"
              style={{ marginRight: '1rem', marginBottom: '1rem' }}
            >
              게임 시작
            </button>
            <button
              onClick={goHome}
              className="pixel-button px-6 py-3 text-lg"
              style={{ marginBottom: '1rem' }}
            >
              돌아가기
            </button>
          </div>
        </ConsoleWindow>
      </div>
    );
  }

  // 성공 화면
  if (gameState === 'success') {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center bg-console-bg">
        <ConsoleWindow className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">🎉 성공!</h2>
          <p className="mb-2" style={{ paddingLeft: '10px', paddingRight: '10px' }}>20초 동안 생존했습니다!</p>
          <p className="mb-2">피한 차량: {dodgedCars}대</p>
          <p className="mb-6 text-lg">최종 점수: {score}점</p>
          <div className="flex gap-4 justify-center">
            <button onClick={restartGame} className="pixel-button px-6 py-3" style={{ marginRight: '10px', marginBottom: '10px' }}>
              다시하기
            </button>
            <button onClick={goHome} className="pixel-button px-6 py-3" style={{ marginBottom: '10px' }}>
              홈으로
            </button>
          </div>
        </ConsoleWindow>
      </div>
    );
  }

  // 충돌 화면
  if (gameState === 'collision') {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center bg-console-bg">
        <ConsoleWindow className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">💥 대형사고!</h2>
          <p className="mb-2" style={{ paddingLeft: '10px', paddingRight: '10px' }}>차량과 충돌했습니다!</p>
          <p className="mb-2">피한 차량: {dodgedCars}대</p>
          <p className="mb-6 text-lg">점수: {score}점</p>
          <div className="flex gap-4 justify-center">
            <button onClick={restartGame} className="pixel-button px-6 py-3" style={{ marginRight: '10px', marginBottom: '10px' }}>
              다시하기
            </button>
            <button onClick={goHome} className="pixel-button px-6 py-3" style={{ marginBottom: '10px' }}>
              홈으로
            </button>
          </div>
        </ConsoleWindow>
      </div>
    );
  }

  // 게임 플레이 화면
  return (
    <div className="min-h-screen p-2 bg-console-bg flex flex-col justify-center">
      <div className="w-full max-w-2xl mx-auto">
        {/* 상단 정보 */}
        <div className="flex justify-between items-center mb-4">
          <button onClick={goHome} className="pixel-button px-3 py-2 text-sm">
            ← 홈으로
          </button>
          <div className="text-center flex-1" style={{ marginLeft: '2rem', marginRight: '2rem' }}>
            <div className="text-sm mb-1">⏱ {timeLeft}초</div>
            <ProgressBar current={20 - timeLeft} total={20} />
          </div>
          <div className="text-right">
            <div className="text-sm">점수: {score}</div>
            <div className="text-xs text-console-fg/70">피한차: {dodgedCars}</div>
          </div>
        </div>

        {/* 게임 영역 */}
        <div 
          className="relative bg-gray-800 border-4 border-gray-900 rounded-lg overflow-hidden"
          style={{ height: '450px' }}
        >
          {/* 장애물 차량들 */}
          {obstacles.map(obs => {
            const laneX = 16.67 + (obs.lane * 33.33);
            return (
              <div
                key={obs.id}
                className="absolute"
                style={{
                  left: `${laneX}%`,
                  top: `${obs.y}px`,
                  transform: 'translateX(-50%)',
                  width: '50px',
                  height: '70px',
                  zIndex: 500
                }}
              >
                {/* 차체 - 심플하게 */}
                <div className="w-full h-full bg-red-500 border-2 border-red-700 rounded-md" />
              </div>
            );
          })}

          {/* 플레이어 차량 */}
          <div
            className="absolute transition-all duration-200"
            style={{
              left: `${16.67 + (playerLane * 33.33)}%`,
              bottom: '70px',
              transform: 'translateX(-50%)',
              width: '50px',
              height: '60px',
            }}
          >
            {/* 차체 - 심플하게 */}
            <div className="w-full h-full bg-blue-500 border-2 border-blue-700 rounded-md relative">
              {/* 플레이어 표시 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-sm font-bold">YOU</span>
              </div>
            </div>
          </div>

          {/* 차선 구분선 - 흰색 점선 */}
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 9999
            }}
          >
            {/* 1차선과 2차선 구분선 */}
            <div
              style={{
                position: 'absolute',
                left: '33.33%',
                top: 0,
                width: '3px',
                height: '100%',
                background: 'repeating-linear-gradient(to bottom, white 0px, white 15px, transparent 15px, transparent 30px)',
                transform: 'translateX(-50%)'
              }}
            />
            
            {/* 2차선과 3차선 구분선 */}
            <div
              style={{
                position: 'absolute',
                left: '66.67%',
                top: 0,
                width: '3px',
                height: '100%',
                background: 'repeating-linear-gradient(to bottom, white 0px, white 15px, transparent 15px, transparent 30px)',
                transform: 'translateX(-50%)'
              }}
            />
          </div>
        </div>

        {/* 컨트롤 */}
        <div className="flex justify-between items-center mt-4 pt-4" style={{paddingTop: '10px'}}>
          <button
            onClick={() => changeLane('left')}
            disabled={playerLane === 0}
            className={`pixel-button w-20 h-20 text-3xl ${
              playerLane === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            ◀
          </button>
          
          <button
            onClick={() => changeLane('right')}
            disabled={playerLane === 2}
            className={`pixel-button w-20 h-20 text-3xl ${
              playerLane === 2 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
};