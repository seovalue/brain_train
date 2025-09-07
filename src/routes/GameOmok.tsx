import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { track } from '@vercel/analytics';
import { useSEO } from '../lib/seo/useSEO';

type Stone = 0 | 1 | 2; // 0: empty, 1: black(player), 2: white(cpu)

const BOARD_SIZE = 13; // 모바일 가독성 고려 13x13

function createBoard(): Stone[][] {
  return Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => 0 as Stone));
}

function inBounds(x: number, y: number) {
  return x >= 0 && y >= 0 && x < BOARD_SIZE && y < BOARD_SIZE;
}

function checkWin(board: Stone[][], x: number, y: number, who: Stone): boolean {
  if (who === 0) return false;
  const dirs = [
    [1, 0], // 가로
    [0, 1], // 세로
    [1, 1], // 대각 ↘
    [1, -1], // 대각 ↗
  ];
  for (const [dx, dy] of dirs) {
    let count = 1;
    // 한쪽으로
    for (let step = 1; step < 5; step++) {
      const nx = x + dx * step;
      const ny = y + dy * step;
      if (!inBounds(nx, ny) || board[ny][nx] !== who) break;
      count++;
    }
    // 반대쪽으로
    for (let step = 1; step < 5; step++) {
      const nx = x - dx * step;
      const ny = y - dy * step;
      if (!inBounds(nx, ny) || board[ny][nx] !== who) break;
      count++;
    }
    if (count >= 5) return true;
  }
  return false;
}

function getAllEmpty(board: Stone[][]): Array<{ x: number; y: number }> {
  const out: Array<{ x: number; y: number }> = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x] === 0) out.push({ x, y });
    }
  }
  return out;
}

// 연결 길이 평가(해당 지점 포함 최대 연속 길이)
// (구버전 평가 함수 제거)

function simulatePlace<T>(board: Stone[][], x: number, y: number, who: Stone, fn: (b: Stone[][]) => T): T {
  const next = board.map((row) => row.slice()) as Stone[][];
  next[y][x] = who;
  return fn(next);
}

function countOneSide(board: Stone[][], x: number, y: number, dx: number, dy: number, who: Stone): number {
  let cnt = 0;
  let nx = x + dx;
  let ny = y + dy;
  while (inBounds(nx, ny) && board[ny][nx] === who && cnt < 4) {
    cnt++;
    nx += dx;
    ny += dy;
  }
  return cnt;
}

function analyzeLineAfterPlace(board: Stone[][], x: number, y: number, who: Stone, dx: number, dy: number) {
  // 전제: (x,y)에 who가 방금 놓였다고 가정
  const a = countOneSide(board, x, y, dx, dy, who);
  const b = countOneSide(board, x, y, -dx, -dy, who);
  const len = a + b + 1;
  const end1x = x + (a + 1) * dx, end1y = y + (a + 1) * dy;
  const end2x = x - (b + 1) * dx, end2y = y - (b + 1) * dy;
  const open1 = inBounds(end1x, end1y) && board[end1y][end1x] === 0 ? 1 : 0;
  const open2 = inBounds(end2x, end2y) && board[end2y][end2x] === 0 ? 1 : 0;
  const openEnds = open1 + open2;
  return { len, openEnds };
}

function analyzeThreatsAt(board: Stone[][], x: number, y: number, who: Stone) {
  // 전제: (x,y)에 who가 놓였다고 가정하고 위협 수치 평가
  const dirs: Array<[number, number]> = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
  ];
  let openThree2 = 0; // 양쪽 열린 3
  let openFour2 = 0;  // 양쪽 열린 4
  let openFour1 = 0;  // 한쪽만 열린 4(닫힌 4)
  let openTwo2 = 0;   // 양쪽 열린 2(잠재 열린3)
  let maxLen = 1;
  for (const [dx, dy] of dirs) {
    const { len, openEnds } = analyzeLineAfterPlace(board, x, y, who, dx, dy);
    if (len > maxLen) maxLen = len;
    if (len === 4 && openEnds === 2) openFour2++;
    if (len === 4 && openEnds === 1) openFour1++;
    if (len === 3 && openEnds === 2) openThree2++;
    if (len === 2 && openEnds === 2) openTwo2++;
  }
  return { openThree2, openFour2, openFour1, openTwo2, maxLen };
}

// 개선된 CPU: 1) 즉시승 기회 → 2) 상대 즉시승 차단 → 3) 위협(상대 4/강3) 차단 → 4) 우리 확장(4/3) → 5) 중앙가중치
function pickCpuMove(board: Stone[][], lastMove: { x: number; y: number } | null): { x: number; y: number } | null {
  const empties = getAllEmpty(board);
  if (empties.length === 0) return null;

  // 1) 시스템 즉시 승리 수
  for (const p of empties) {
    const win = simulatePlace(board, p.x, p.y, 2, (b) => checkWin(b, p.x, p.y, 2));
    if (win) return p;
  }

  // 2) 유저 즉시 승리 수 차단
  for (const p of empties) {
    const oppWin = simulatePlace(board, p.x, p.y, 1, (b) => checkWin(b, p.x, p.y, 1));
    if (oppWin) return p;
  }

  // 가중치/스코어 함수 정의
  const mid = (BOARD_SIZE - 1) / 2;

  const scoreCpuAt = (bx: number, by: number): number => {
    const oppThreat = simulatePlace(board, bx, by, 1, (b) => analyzeThreatsAt(b, bx, by, 1));
    const myThreat = simulatePlace(board, bx, by, 2, (b) => analyzeThreatsAt(b, bx, by, 2));
    const centerBias = 8 - (Math.abs(bx - mid) + Math.abs(by - mid));
    let score = 0;
    // 열린4(양쪽/닫힘) 세분화 + 열린3 강화 + 열린2(잠재3)
    score += oppThreat.openFour2 * 1200 + oppThreat.openFour1 * 900;
    score += myThreat.openFour2 * 1100 + myThreat.openFour1 * 800;
    score += oppThreat.openThree2 * 500 + myThreat.openThree2 * 420;
    score += oppThreat.openTwo2 * 160 + myThreat.openTwo2 * 120;
    // 포크(복수 위협)
    const oppFork = (oppThreat.openFour2 * 2) + oppThreat.openFour1 + oppThreat.openThree2;
    const myFork = (myThreat.openFour2 * 2) + myThreat.openFour1 + myThreat.openThree2;
    if (oppFork >= 2) score += 800;
    if (myFork >= 2) score += 700;
    // 연속 길이 + 중앙 + 근접
    score += myThreat.maxLen * 22 + oppThreat.maxLen * 26 + centerBias;
    if (lastMove) {
      const d = Math.abs(bx - lastMove.x) + Math.abs(by - lastMove.y);
      score += Math.max(0, 6 - d);
    }
    return score;
  };

  // 후보 축소: 상위 N개만 탐색
  const scored = empties.map((p) => ({ p, s: scoreCpuAt(p.x, p.y) }));
  scored.sort((a, b) => b.s - a.s);
  const topN = scored.slice(0, Math.min(14, scored.length));

  // 공격 우선 후보: 우리 열린4 생성 또는 복수 위협 생성이고, 상대 즉시승 응수가 없는 경우
  const aggressiveCandidates: Array<{ p: { x: number; y: number }; base: number }>
    = topN.filter(({ p }) => {
      const myThr = simulatePlace(board, p.x, p.y, 2, (b) => analyzeThreatsAt(b, p.x, p.y, 2));
      const myFork = (myThr.openFour2 * 2) + myThr.openFour1 + myThr.openThree2;
      const isAggressive = myThr.openFour2 > 0 || myFork >= 2;
      if (!isAggressive) return false;
      // 상대 즉시승 응수 있는지 확인
      const after = board.map((r) => r.slice()) as Stone[][];
      after[p.y][p.x] = 2;
      const empt2 = getAllEmpty(after);
      for (const q of empt2) {
        const win = simulatePlace(after, q.x, q.y, 1, (b) => checkWin(b, q.x, q.y, 1));
        if (win) return false; // 우리의 공격 직후 상대 즉시승 가능 → 제외
      }
      return true;
    }).map(({ p, s }) => ({ p, base: s }));

  if (aggressiveCandidates.length) {
    let bestAgg: { p: { x: number; y: number }; score: number } | null = null;
    for (const { p, base } of aggressiveCandidates) {
      const after = board.map((r) => r.slice()) as Stone[][];
      after[p.y][p.x] = 2;
      const empt2 = getAllEmpty(after);
      const oppScoreAt = (qx: number, qy: number): number => {
        const thr = simulatePlace(after, qx, qy, 1, (b) => analyzeThreatsAt(b, qx, qy, 1));
        const centerBias = 8 - (Math.abs(qx - mid) + Math.abs(qy - mid));
        let sc = 0;
        sc += thr.openFour2 * 1150 + thr.openFour1 * 850; // 약간 공격적 튜닝
        sc += thr.openThree2 * 420;
        sc += thr.openTwo2 * 140;
        sc += thr.maxLen * 24 + centerBias;
        const fork = (thr.openFour2 * 2) + thr.openFour1 + thr.openThree2;
        if (fork >= 2) sc += 800;
        return sc;
      };
      const oppScored = empt2.map((q) => ({ q, s: oppScoreAt(q.x, q.y) }));
      oppScored.sort((a, b) => b.s - a.s);
      const worstReply = oppScored.length ? oppScored[0].s : 0;
      const finalScore = base - 0.85 * worstReply; // 공격 모드 시 약간 완화
      if (!bestAgg || finalScore > bestAgg.score) bestAgg = { p, score: finalScore };
    }
    if (bestAgg) return bestAgg.p;
  }

  // 1-ply 미니맥스: 우리 한 수 → 상대 한 수의 최선 위협을 고려해 평가
  let best: { p: { x: number; y: number }; score: number } | null = null;
  for (const { p, s: base } of topN) {
    // 가상 착수 후 상대 응수 평가
    const after = board.map((r) => r.slice()) as Stone[][];
    after[p.y][p.x] = 2;
    if (checkWin(after, p.x, p.y, 2)) {
      // 즉시승 수는 바로 선택(이미 위에서 처리했지만 안전망)
      return p;
    }
    const empt2 = getAllEmpty(after);
    if (empt2.length === 0) {
      if (!best || base > best.score) best = { p, score: base };
      continue;
    }
    // 상대 즉시승 응수 체크
    let oppImmediate = false;
    for (const q of empt2) {
      const win = simulatePlace(after, q.x, q.y, 1, (b) => checkWin(b, q.x, q.y, 1));
      if (win) { oppImmediate = true; break; }
    }
    if (oppImmediate) {
      // 즉시승 유발 수는 점수 큰 폭 감점
      const penalized = base - 1500;
      if (!best || penalized > best.score) best = { p, score: penalized };
      continue;
    }
    // 상대 후보 상위 M개만 평가
    const oppScoreAt = (qx: number, qy: number): number => {
      const thr = simulatePlace(after, qx, qy, 1, (b) => analyzeThreatsAt(b, qx, qy, 1));
      const centerBias = 8 - (Math.abs(qx - mid) + Math.abs(qy - mid));
      let sc = 0;
      sc += thr.openFour2 * 1150 + thr.openFour1 * 850;
      sc += thr.openThree2 * 420; // 방어 과도성 완화
      sc += thr.openTwo2 * 140;
      sc += thr.maxLen * 24 + centerBias;
      if (lastMove) {
        const d = Math.abs(qx - lastMove.x) + Math.abs(qy - lastMove.y);
        sc += Math.max(0, 5 - d);
      }
      // 복수 위협 가산
      const fork = (thr.openFour2 * 2) + thr.openFour1 + thr.openThree2;
      if (fork >= 2) sc += 850;
      return sc;
    };

    const oppScored = empt2.map((q) => ({ q, s: oppScoreAt(q.x, q.y) }));
    oppScored.sort((a, b) => b.s - a.s);
    const topM = oppScored.slice(0, Math.min(10, oppScored.length));
    const worstReply = topM.length ? topM[0].s : 0;
    // 우리 점수에서 상대 최선 응수의 위협을 감산(람다 0.9)
    const finalScore = base - 0.9 * worstReply;
    if (!best || finalScore > best.score) best = { p, score: finalScore };
  }

  return best ? best.p : empties[Math.floor(Math.random() * empties.length)];
}

const cellSize = 26; // px (모바일 가독성 향상)

// (구버전 StoneView 제거)

const BoardView: React.FC<{
  board: Stone[][];
  onPlay: (x: number, y: number) => void;
  disabled?: boolean;
}> = ({ board, onPlay, disabled }) => {
  // 교차점 절대배치 방식: 각 교차점에 클릭 핫스팟/돌을 배치
  const boardPx = BOARD_SIZE * cellSize;
  const margin = cellSize / 2; // 격자선이 가장자리에서 margin만큼 띄워져 시작/끝
  const clickSize = Math.max(16, Math.floor(cellSize * 0.8));
  const stoneSize = clickSize - 4;

  return (
    <div className="console-window" style={{ padding: 6, width: boardPx + 12, margin: '0 auto' }}>
      <div
        style={{
          position: 'relative',
          width: boardPx,
          height: boardPx,
          background: '#C89F65', // 바둑판 톤(레트로)
          boxShadow: 'inset 2px 2px 0 rgba(255,255,255,0.2), inset -2px -2px 0 rgba(0,0,0,0.3)'
        }}
      >
        {/* 격자 라인 */}
        {Array.from({ length: BOARD_SIZE }).map((_, y) => (
          <div key={`row-${y}`} style={{ position: 'absolute', top: y * cellSize + margin, left: margin, right: margin, height: 1, background: '#452' }} />
        ))}
        {Array.from({ length: BOARD_SIZE }).map((_, x) => (
          <div key={`col-${x}`} style={{ position: 'absolute', left: x * cellSize + margin, top: margin, bottom: margin, width: 1, background: '#452' }} />
        ))}

        {/* 착점 인터랙션 + 돌 렌더: 교차점에 배치 */}
        {board.map((row, y) =>
          row.map((cell, x) => {
            const top = y * cellSize + margin;
            const left = x * cellSize + margin;
            return (
              <button
                key={`pt-${x}-${y}`}
                onClick={() => onPlay(x, y)}
                disabled={disabled || cell !== 0}
                aria-label={`${x + 1}, ${y + 1} 교차점에 두기`}
                title={`${x + 1}, ${y + 1}`}
                style={{
                  position: 'absolute',
                  top,
                  left,
                  transform: 'translate(-50%, -50%)',
                  width: clickSize,
                  height: clickSize,
                  borderRadius: '50%',
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: disabled || cell !== 0 ? 'default' : 'pointer',
                }}
              >
                {cell !== 0 && (
                  <div
                    style={{
                      width: stoneSize,
                      height: stoneSize,
                      borderRadius: '50%',
                      background: cell === 1 ? '#111' : '#eee',
                      border: `2px solid ${cell === 1 ? '#555' : '#999'}`,
                      boxShadow: 'inset -1px -1px 0 rgba(0,0,0,0.4)',
                    }}
                  />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

// 상단 바(홈으로) - GameRPS와 유사 배치
const HeaderBar: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="mb-2 flex-shrink-0">
    <button className="pixel-button mb-2 text-xs" onClick={onBack} style={{ marginBottom: '1rem', marginTop: '-20px' }}>
      ← 홈으로
    </button>
  </div>
);

const InfoBar: React.FC<{ turn: Stone; finished: boolean; winner: Stone | 0; timeLeft?: number }> = ({ turn, finished, winner, timeLeft }) => {
  let text = turn === 1 ? '내 차례 (⚫)' : 'CPU 차례 (⚪)';
  if (!finished && turn === 1 && typeof timeLeft === 'number') {
    text = `${text} · ${timeLeft}초`;
  }
  if (finished) {
    text = winner === 1 ? '게임 종료 · 내 승리' : winner === 2 ? '게임 종료 · CPU 승' : '게임 종료 · 무승부';
  }
  return (
    <div className="console-window px-3 py-2 text-xs mb-2" style={{ textAlign: 'center', marginBottom:'12px', padding: '5px' }}>{text}</div>
  );
};

const FooterActions: React.FC<{ onReset: () => void; canReset: boolean }> = ({ onReset, canReset }) => (
  <div className="flex gap-2 mt-3">
    <button className="pixel-button flex-1" onClick={onReset} disabled={!canReset}>다시하기</button>
  </div>
);

const useOmok = () => {
  const [board, setBoard] = useState<Stone[][]>(createBoard);
  const [turn, setTurn] = useState<Stone>(1); // 흑(플레이어) 선
  const [finished, setFinished] = useState(false);
  const [winner, setWinner] = useState<Stone | 0>(0);
  const [lastMove, setLastMove] = useState<{ x: number; y: number } | null>(null);
  const [endReason, setEndReason] = useState<'five' | 'timeout' | 'draw' | null>(null);

  const emptyCount = useMemo(() => getAllEmpty(board).length, [board]);

  const reset = () => {
    setBoard(createBoard());
    setTurn(1);
    setFinished(false);
    setWinner(0);
    setLastMove(null);
    setEndReason(null);
  };

  const place = (x: number, y: number, who: Stone): boolean => {
    if (finished) return false;
    if (!inBounds(x, y) || board[y][x] !== 0) return false;
    const next = board.map((row) => row.slice()) as Stone[][];
    next[y][x] = who;
    setBoard(next);
    setLastMove({ x, y });
    if (checkWin(next, x, y, who)) {
      setFinished(true);
      setWinner(who);
      setEndReason('five');
    }
    return true;
  };

  const playerPlay = (x: number, y: number) => {
    if (turn !== 1 || finished) return;
    const ok = place(x, y, 1);
    if (!ok) return;
    if (!finished) setTurn(2);
  };

  const cpuPlay = () => {
    if (finished) return;
    const pick = pickCpuMove(board, lastMove);
    if (!pick) {
      setFinished(true);
      setWinner(0);
      setEndReason('draw');
      return;
    }
    const ok = place(pick.x, pick.y, 2);
    if (!ok) return;
    if (!finished) setTurn(1);
  };

  const playerTimeout = () => {
    if (!finished && turn === 1) {
      setFinished(true);
      setWinner(2); // 시간 초과 → 즉시 패배(CPU 승)
      setEndReason('timeout');
    }
  };

  return { board, turn, finished, winner, reset, playerPlay, cpuPlay, playerTimeout, emptyCount, endReason };
};

export const GameOmok: React.FC = () => {
  const navigate = useNavigate();
  const { board, turn, finished, winner, reset, playerPlay, cpuPlay, playerTimeout, emptyCount, endReason } = useOmok();
  const MOVE_TIMEOUT_SEC = 20;
  const [timeLeft, setTimeLeft] = useState<number>(MOVE_TIMEOUT_SEC);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // SEO
  useSEO({
    title: '오목 - 교차점 착점 레트로 보드',
    description: '13x13 보드에서 교차점에 돌을 두고 CPU와 겨루는 오목 게임. 레트로 콘솔 감성 UI와 접근 가능한 터치 인터랙션 지원.',
    robots: 'index,follow',
  });

  // CPU 차례 자동 둠 (간단한 턴 루프)
  React.useEffect(() => {
    if (finished) return;
    if (turn === 2) {
      const t = setTimeout(() => cpuPlay(), 350); // 약간의 딜레이로 연출
      return () => clearTimeout(t);
    }
  }, [turn, finished, cpuPlay]);

  // 플레이어 차례 제한 시간 20초
  React.useEffect(() => {
    // 기존 타이머 정리
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (finished) return;
    if (turn === 1) {
      setTimeLeft(MOVE_TIMEOUT_SEC);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            // 시간 초과 → CPU 차례로 전환
            playerTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [turn, finished]);

  // 게임 종료 시 승/패/무 및 종료 사유 트래킹
  React.useEffect(() => {
    if (!finished) return;
    try {
      const outcome = winner === 1 ? 'win' : winner === 2 ? 'lose' : 'draw';
      const totalCells = BOARD_SIZE * BOARD_SIZE;
      const movesPlayed = totalCells - (typeof emptyCount === 'number' ? emptyCount : 0);
      track('game_completed', {
        gameType: 'omok',
        outcome,
        reason: endReason ?? 'unknown',
        movesPlayed,
      });
    } catch (e) {
      // no-op: 분석 실패는 사용자 흐름에 영향 주지 않음
    }
  }, [finished, winner, endReason, emptyCount]);

  return (
    <div className="min-h-screen flex items-center justify-center p-2">
      <div className="w-full max-w-[355px] h-[620px] flex flex-col">
        {/* 헤더 (상단 고정) */}
        <HeaderBar onBack={() => navigate('/')} />

        {/* 메인 콘솔 영역 (중앙) */}
        <div className="console-window flex-grow flex flex-col items-center justify-center text-center p-3">
          {/* 상태(턴 안내) */}
          <InfoBar turn={turn} finished={finished} winner={winner} timeLeft={timeLeft} />
          {/* 보드 */}
          <BoardView board={board} onPlay={playerPlay} disabled={finished || turn !== 1} />
          {/* 피드백 */}
          {finished && (
            <div className={`feedback-badge ${winner === 1 ? 'feedback-correct' : 'feedback-wrong'}`} style={{ marginTop: 12 }}>
              {winner === 1 ? '▶ YOU WIN' : winner === 2 ? '▶ YOU LOSE..' : '▶ DRAW'}
            </div>
          )}
        </div>

        {/* 푸터 (하단 고정) */}
        <div className="mt-2 flex-shrink-0" style={{ padding: '10px'}}>
          <FooterActions onReset={reset} canReset={true} />
        </div>
      </div>
    </div>
  );
};

export default GameOmok;
