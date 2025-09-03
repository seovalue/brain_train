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
type Pickup = {
  id: string;
  lane: Lane;
  y: number;
  speed: number;
};

export const GameDriving: React.FC = () => {
  const navigate = useNavigate();
  const [playerLane, setPlayerLane] = useState<Lane>(1);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [pickups, setPickups] = useState<Pickup[]>([]);
  // 최신 픽업 상태를 interval 콜백에서 안전하게 참조하기 위한 ref
  const pickupsRef = useRef<Pickup[]>([]);
  const [timeLeft, setTimeLeft] = useState(20);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'success' | 'collision'>('ready');
  const [score, setScore] = useState(0);
  const [dodgedCars, setDodgedCars] = useState(0);
  const [coins, setCoins] = useState(0);
  // 코인 스폰 속도 제어(초당 최대 2개)
  const coinSpawnTimesRef = useRef<number[]>([]);
  const gameAreaRef = useRef<HTMLDivElement | null>(null);
  const [gameHeight, setGameHeight] = useState<number>(450);
  const gameHeightRef = useRef<number>(450);
  const gameLoopRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const elapsedRef = useRef<number>(0);

  // 게임 시작
  const startGame = useCallback(() => {
    track('game_started', {
      gameType: 'driving',
      gameTitle: '픽셀 드라이빙',
    });
    
    setGameState('playing');
    setPlayerLane(1);
    setObstacles([]);
    setPickups([]);
    setTimeLeft(20);
    setScore(0);
    setDodgedCars(0);
    setCoins(0);
    // reset coin spawn timestamps
    coinSpawnTimesRef.current = [];
    lastFrameRef.current = null;
    elapsedRef.current = 0;
  }, []);

  // 게임 루프
  useEffect(() => {
    if (gameState !== 'playing') return;

    // 게임 영역 크기 측정 및 리사이즈 대응
    const updateDimensions = () => {
      const h = gameAreaRef.current?.clientHeight ?? 450;
      setGameHeight(h);
      gameHeightRef.current = h;
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);

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

    // 장애물 생성 - 플레이어 위치에 항상 하나 + 추가로 더 많이 생성
    const obstacleGenerator = setInterval(() => {
      setObstacles(prev => {
        // 현재 화면 상단 근처에 장애물이 있는 차선 확인
        const occupiedLanes = prev
          .filter(obs => obs.y < 150)
          .map(obs => obs.lane);
        
        // 코인이 존재하는 차선(코인 보호 구간): 코인이 플레이어 영역 위에 있을 때 해당 레인은 스폰 금지
        const coinProtectedLanes = pickupsRef.current
          // 보호 범위 70%
          .filter(pk => pk.y < gameHeightRef.current * 0.7)
          .map(pk => pk.lane);

        // 사용 가능한 차선 확인 (장애물 상단 점유 + 코인 보호 레인 제외)
        const availableLanes = [0, 1, 2]
          .filter(lane => !occupiedLanes.includes(lane as Lane))
          .filter(lane => !coinProtectedLanes.includes(lane as Lane)) as Lane[];
        
        if (availableLanes.length === 0) return prev;
        
        const newObstacles: Obstacle[] = [];
        
        // 플레이어 위치에 장애물 생성 (필수)
        if (availableLanes.includes(playerLane)) {
          newObstacles.push({
            id: `obs-${Date.now()}-player`,
            lane: playerLane,
            y: -(gameHeightRef.current * 0.16),
            // px per second
            speed: (gameHeightRef.current * 0.6) * (0.8 + Math.random() * 0.4),
          });
          // 사용한 차선 제거
          const playerLaneIndex = availableLanes.indexOf(playerLane);
          availableLanes.splice(playerLaneIndex, 1);
        }
        
        // 항상 추가 장애물 1개 생성 (가능한 경우)
        if (availableLanes.length > 0) {
          const randomLane1 = availableLanes[
            Math.floor(Math.random() * availableLanes.length)
          ] as Lane;
          newObstacles.push({
            id: `obs-${Date.now()}-extra1`,
            lane: randomLane1,
            y: -(gameHeightRef.current * 0.16),
            speed: (gameHeightRef.current * 0.6) * (0.8 + Math.random() * 0.4),
          });
          // 사용한 차선 제거
          const idx = availableLanes.indexOf(randomLane1);
          if (idx >= 0) availableLanes.splice(idx, 1);
        }

        // 동시 생성 장애물은 최대 2레인까지만 생성
        
        return [...prev, ...newObstacles];
      });
    }, 1000); // 생성 간격을 1500ms -> 1000ms로 조정하여 밀도 증가

    // 코인 스폰 유틸: 최근 1초 내 스폰 수 제한(최대 2)
    const canSpawnCoin = () => {
      const now = Date.now();
      coinSpawnTimesRef.current = coinSpawnTimesRef.current.filter(t => now - t < 1000);
      return coinSpawnTimesRef.current.length < 2;
    };

    // 픽업 생성 (코인)
    const pickupGenerator = setInterval(() => {
      if (!canSpawnCoin()) return; // 초당 최대 2개 제한
      setPickups(prev => {
        const createChance = Math.random();
        if (createChance >= 0.6) return prev; // 40% chance to spawn
        // avoid lanes with an obstacle near spawn zone
        const spawnBand = gameHeightRef.current * 0.3;
        const occupied = obstacles
          .filter(o => o.y < spawnBand)
          .map(o => o.lane);
        const candidates = [0,1,2].filter(l => !occupied.includes(l as Lane)) as Lane[];
        if (candidates.length === 0) return prev;
        const lane = candidates[Math.floor(Math.random() * candidates.length)] as Lane;
        const coin: Pickup = {
          id: `pk-${Date.now()}`,
          lane,
          y: -(gameHeightRef.current * 0.12),
          speed: (gameHeightRef.current * 0.5) * (0.9 + Math.random() * 0.3),
        };
        // 스폰 기록 업데이트
        coinSpawnTimesRef.current.push(Date.now());
        return [...prev, coin];
      });
    }, 1800);

    // ensure at least one early coin
    const firstCoinTimeout = setTimeout(() => {
      if (!canSpawnCoin()) return; // 초당 최대 2개 제한
      setPickups(prev => {
        const spawnBand = gameHeightRef.current * 0.3;
        const occupied = obstacles
          .filter(o => o.y < spawnBand)
          .map(o => o.lane);
        const candidates = [0,1,2].filter(l => !occupied.includes(l as Lane)) as Lane[];
        if (candidates.length === 0) return prev;
        const lane = candidates[Math.floor(Math.random() * candidates.length)] as Lane;
        const coin: Pickup = {
          id: `pk-${Date.now()}-first`,
          lane,
          y: -(gameHeightRef.current * 0.12),
          speed: (gameHeightRef.current * 0.5),
        };
        // 스폰 기록 업데이트
        coinSpawnTimesRef.current.push(Date.now());
        return [...prev, coin];
      });
    }, 500);

    // 게임 업데이트 루프
    const gameLoop = (now: number) => {
      if (lastFrameRef.current == null) {
        lastFrameRef.current = now;
      }
      const dt = Math.min(0.05, (now - lastFrameRef.current) / 1000); // clamp to avoid spikes
      lastFrameRef.current = now;

      // difficulty scales with elapsed time (0 -> 1 over 20s)
      elapsedRef.current += dt;
      const progress = Math.min(1, elapsedRef.current / 20);
      const difficultyBoost = 1 + progress * 0.5; // up to +50%

      setObstacles(prev => {
        const updated = prev
          .map(obs => ({
            ...obs,
            // 난이도 상승: 장애물 낙하 속도 8% 증가
            y: obs.y + obs.speed * difficultyBoost * 1.08 * dt,
          }))
          .filter(obs => {
            if (obs.y > gameHeightRef.current) {
              setDodgedCars(c => c + 1);
              return false;
            }
            return true;
          });
        return updated;
      });

      setPickups(prev => prev
        .map(p => ({ ...p, y: p.y + p.speed * dt }))
        .filter(p => p.y <= gameHeightRef.current)
      );

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      clearInterval(timer);
      clearInterval(obstacleGenerator);
      clearInterval(pickupGenerator);
      clearTimeout(firstCoinTimeout);
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      window.removeEventListener('resize', updateDimensions);
    };
  }, [gameState, playerLane]);

  // pickups 최신값을 ref에 동기화
  useEffect(() => {
    pickupsRef.current = pickups;
  }, [pickups]);

  // 충돌 감지
  useEffect(() => {
    if (gameState !== 'playing') return;
    const h = gameHeight;
    const PLAYER_H = h * (60 / 450);
    const PLAYER_BOTTOM = h * (70 / 450);
    const PLAYER_TOP = h - PLAYER_BOTTOM - PLAYER_H;
    const PLAYER_BOTTOM_Y = PLAYER_TOP + PLAYER_H;

    // 장애물 충돌 체크 (히트박스 관대함 적용)
    let collidedObstacleId: string | null = null;
    for (const obs of obstacles) {
      const OB_H = h * (70 / 450);
      const obTop = obs.y;
      const obBottom = obs.y + OB_H;
      // 너무 민감한 판정을 줄이기 위해 히트박스 축소(각 10%)
      const obTopAdj = obTop + OB_H * 0.1;
      const obBottomAdj = obBottom - OB_H * 0.1;
      const playerTopAdj = PLAYER_TOP + PLAYER_H * 0.1;
      const playerBottomAdj = PLAYER_BOTTOM_Y - PLAYER_H * 0.1;
      const verticalOverlap = obBottomAdj >= playerTopAdj && obTopAdj <= playerBottomAdj;
      if (verticalOverlap && obs.lane === playerLane) {
        collidedObstacleId = obs.id;
        break;
      }
    }

    if (collidedObstacleId) {
      setGameState('collision');
      return;
    }

    // 픽업 수집 체크 (coin only)
    const collectedIds: string[] = [];
    for (const p of pickups) {
      const PK_H = h * (38 / 450);
      const pTop = p.y;
      const pBottom = p.y + PK_H;
      const verticalOverlap = pBottom >= PLAYER_TOP && pTop <= PLAYER_BOTTOM_Y;
      if (verticalOverlap && p.lane === playerLane) {
        collectedIds.push(p.id);
        setCoins(c => c + 1);
      }
    }
    if (collectedIds.length > 0) {
      setPickups(prev => prev.filter(pk => !collectedIds.includes(pk.id)));
    }
  }, [obstacles, pickups, playerLane, gameState, gameHeight]);

  // 점수 계산 (코인당 +2점 적용)
  useEffect(() => {
    if (gameState === 'playing') {
      const timeScore = (20 - timeLeft) * 10;
      const dodgeScore = dodgedCars * 50;
      const base = timeScore + dodgeScore;
      const coinBonus = coins * 2;
      setScore(Math.floor(base + coinBonus));
    }
  }, [timeLeft, dodgedCars, gameState, coins]);

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
            <p className="mb-2" style={{ paddingLeft: '10px', paddingRight: '10px' }}>장애물을 피해 20초 동안 생존하세요! 코인은 먹으면 점수가 올라가요.</p>
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
            <div className="text-xs text-console-fg/70">🪙 코인: {coins}</div>
          </div>
        </div>

        {/* 게임 영역 */}
        <div 
          ref={gameAreaRef}
          className="relative bg-gray-800 border-4 border-gray-900 rounded-lg overflow-hidden"
          style={{ height: 'min(60vh, 520px)', minHeight: '320px' }}
        >
          {/* 장애물 차량들 */}
          {obstacles.map(obs => {
            const laneX = 16.67 + (obs.lane * 33.33);
            const carW = gameHeight * (50 / 450);
            const carH = gameHeight * (70 / 450);
            return (
              <div
                key={obs.id}
                className="absolute"
                style={{
                  left: `${laneX}%`,
                  top: `${obs.y}px`,
                  transform: 'translateX(-50%)',
                  width: `${carW}px`,
                  height: `${carH}px`,
                  zIndex: 500
                }}
              >
                {/* 차체 - 심플하게 */}
                <div className="w-full h-full bg-red-500 border-2 border-red-700 rounded-md" />
              </div>
            );
          })}

          {/* 픽업들 (코인) */}
          {pickups.map(pk => {
            const laneX = 16.67 + (pk.lane * 33.33);
            const w = gameHeight * (38 / 450);
            const h = w; // coin is a circle
            return (
              <div
                key={pk.id}
                className="absolute flex items-center justify-center"
                style={{
                  left: `${laneX}%`,
                  top: `${pk.y}px`,
                  transform: 'translateX(-50%)',
                  width: `${w}px`,
                  height: `${h}px`,
                  zIndex: 600
                }}
              >
                <div
                  className="rounded-full"
                  style={{
                    width: '100%',
                    height: '100%',
                    background: '#FFD700',
                    border: '3px solid #7a4f07',
                    boxShadow: '0 3px 6px rgba(0,0,0,0.35), inset 0 -2px 0 rgba(0,0,0,0.15)'
                  }}
                />
              </div>
            );
          })}

          {/* 플레이어 차량 */}
          <div
            className="absolute transition-all duration-200"
            style={{
              left: `${16.67 + (playerLane * 33.33)}%`,
              bottom: `${gameHeight * (70 / 450)}px`,
              transform: 'translateX(-50%)',
              width: `${gameHeight * (50 / 450)}px`,
              height: `${gameHeight * (60 / 450)}px`,
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
              zIndex: 100
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
