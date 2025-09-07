import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConsoleWindow } from '../components/ConsoleWindow';
import { ProgressBar } from '../components/ProgressBar';
import { FeedbackBadge } from '../components/FeedbackBadge';
import { useDailyQuizStore } from '../stores/dailyQuiz';
import type { Question } from '../types';
import { useSEO } from '../lib/seo/useSEO';

// 게임 설정
const TOTAL_ROUNDS = 5;
const TWO_IN_A_ROW_TYPE = "가로 2연석"; // 2연석 타입 (가로 2연석만)

// 그리드 크기 설정
const GRID_SIZES = [8, 10, 15, 20, 25]; // 각 라운드별 그리드 크기

// 제한시간 설정
const TIME_LIMITS = [4, 4, 2, 1, 1]; // 각 라운드별 제한시간

type CellState = {
  isOccupied: boolean;
  isSelected: boolean;
  isPartOfTwoInARow: boolean;
};

export default function GameTwoInARow() {
  const navigate = useNavigate();
  useSEO({
    title: '2연석 줍줍 ⚾ - 티켓팅 훈련',
    description: '야구장 2연석을 빠르게 찾아 클릭하는 집중력/시각 탐색 훈련 게임.',
    robots: 'index,follow',
  });
  const { 
    currentQuestionIndex, 
    currentQuestion: storeCurrentQuestion,
    startQuiz, 
    submitAnswer, 
    nextQuestion, 
    finishQuiz,
    resetQuiz
  } = useDailyQuizStore();
  
  const [currentQuestionData, setCurrentQuestionData] = useState<Question | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMITS[0]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [gridState, setGridState] = useState<CellState[][]>([]);
  const [selectedCells, setSelectedCells] = useState<Array<{row: number, col: number}>>([]);

  const nextQuestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 컴포넌트 마운트 시 store 초기화 및 게임 시작
  useEffect(() => {
    // 이전 게임 상태 정리
    resetQuiz();
    
    // 새로운 문제 생성
    const twoInARowQuestions = Array.from({ length: TOTAL_ROUNDS }, (_, i) => ({
      id: `two-in-a-row-${i}`,
      type: 'TWO_IN_A_ROW' as any,
      prompt: TWO_IN_A_ROW_TYPE,
      answer: 1,
      format: { decimals: 0 }
    }));
    
    startQuiz(twoInARowQuestions, 'two-in-a-row');
  }, []); // 빈 의존성 배열로 마운트 시에만 실행

  // 현재 문제 데이터 설정
  useEffect(() => {
    if (storeCurrentQuestion) {
      setCurrentQuestionData(storeCurrentQuestion);
      
      // 현재 라운드에 맞는 설정 계산
      const currentTimeLimit = TIME_LIMITS[currentQuestionIndex];
      const currentGridSize = GRID_SIZES[currentQuestionIndex];
      
      setTimeLeft(currentTimeLimit);
      
      // 그리드 생성 및 2연석 배치
      const newGrid = createGridWithTwoInARow(currentGridSize);
      setGridState(newGrid);
      
      // 상태 초기화
      setSelectedCells([]);
    }
  }, [storeCurrentQuestion, currentQuestionIndex]);

  // 문제 변경 시 상태 초기화
  useEffect(() => {
    // 이전 타이머 정리
    if (nextQuestionTimeoutRef.current) {
      clearTimeout(nextQuestionTimeoutRef.current);
      nextQuestionTimeoutRef.current = null;
    }
    
    setShowFeedback(false);
    setFeedbackMessage("");
    setIsCorrect(false);
    setIsAnswered(false);
    setSelectedCells([]);
    
    // 현재 라운드에 맞는 시간 설정
    const currentTimeLimit = TIME_LIMITS[currentQuestionIndex];
    setTimeLeft(currentTimeLimit);
  }, [currentQuestionIndex]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (nextQuestionTimeoutRef.current) {
        clearTimeout(nextQuestionTimeoutRef.current);
      }
    };
  }, []);

  // 2연석이 있는 그리드 생성
  const createGridWithTwoInARow = (gridSize: number): CellState[][] => {
    const grid: CellState[][] = Array.from({ length: gridSize }, () => 
      Array.from({ length: gridSize }, () => ({
        isOccupied: false,
        isSelected: false,
        isPartOfTwoInARow: false
      }))
    );

    // 가로 2연석 생성
    const row = Math.floor(Math.random() * gridSize);
    const col = Math.floor(Math.random() * (gridSize - 1));
    grid[row][col].isOccupied = true;
    grid[row][col].isPartOfTwoInARow = true;
    grid[row][col + 1].isOccupied = true;
    grid[row][col + 1].isPartOfTwoInARow = true;

    // 랜덤하게 몇 개의 추가 셀 배치 (2연석과 떨어져서)
    const additionalCells = Math.floor(gridSize * 0.3); // 그리드 크기의 30%만큼
    let placed = 0;
    
    while (placed < additionalCells) {
      const randomRow = Math.floor(Math.random() * gridSize);
      const randomCol = Math.floor(Math.random() * gridSize);
      
      if (!grid[randomRow][randomCol].isOccupied) {
        grid[randomRow][randomCol].isOccupied = true;
        placed++;
      }
    }

    return grid;
  };

  // 셀 클릭 처리
  const handleCellClick = useCallback((row: number, col: number) => {
    if (isAnswered || !gridState[row][col].isOccupied) return;

    const newSelectedCells = [...selectedCells];
    const cellIndex = newSelectedCells.findIndex(cell => cell.row === row && cell.col === col);
    
    if (cellIndex >= 0) {
      // 이미 선택된 셀이라면 선택 해제
      newSelectedCells.splice(cellIndex, 1);
    } else {
      // 새로운 셀 선택
      newSelectedCells.push({ row, col });
    }
    
    setSelectedCells(newSelectedCells);
    
    // gridState의 isSelected 속성 업데이트
    setGridState(prevGrid => {
      const newGrid = prevGrid.map((gridRow, rowIdx) =>
        gridRow.map((cell, colIdx) => ({
          ...cell,
          isSelected: newSelectedCells.some(selected => selected.row === rowIdx && selected.col === colIdx)
        }))
      );
      return newGrid;
    });
    
    // 2연석이 선택되었는지 확인
    if (newSelectedCells.length === 2) {
      const isTwoInARow = checkIfTwoInARow(newSelectedCells, gridState);
      if (isTwoInARow) {
        handleSuccess();
      }
    }
  }, [isAnswered, gridState, selectedCells]);

  // 선택된 셀들이 2연석인지 확인
  const checkIfTwoInARow = (cells: Array<{row: number, col: number}>, grid: CellState[][]): boolean => {
    if (cells.length !== 2) return false;
    
    const [cell1, cell2] = cells;
    
    // 두 셀 모두 2연석의 일부여야 함
    if (!grid[cell1.row][cell1.col].isPartOfTwoInARow || 
        !grid[cell2.row][cell2.col].isPartOfTwoInARow) {
      return false;
    }
    
    // 가로 2연석 확인
    if (cell1.row === cell2.row && Math.abs(cell1.col - cell2.col) === 1) {
      return true;
    }
    
    return false;
  };

  // 성공 처리
  const handleSuccess = useCallback(() => {
    // 즉시 타이머 정지 및 상태 설정
    setIsAnswered(true);
    setTimeLeft(0); // 타이머를 0으로 설정하여 타이머 효과 정지
    setFeedbackMessage("▶ 정답입니다! 2연석을 찾았습니다! 🎉");
    setIsCorrect(true);
    setShowFeedback(true);
    
    submitAnswer(1, true);
    
    // 다음 문제로 이동
    nextQuestionTimeoutRef.current = setTimeout(() => {
      if (currentQuestionIndex < TOTAL_ROUNDS - 1) {
        nextQuestion();
      } else {
        const result = finishQuiz();
        navigate('/result', { state: { result, gameType: 'two-in-a-row' } });
      }
      nextQuestionTimeoutRef.current = null;
    }, 2000);
  }, [currentQuestionIndex, navigate, submitAnswer, nextQuestion, finishQuiz]);

  // 타이머 효과
  useEffect(() => {
    if (isAnswered) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev: number) => {
        if (prev <= 0.1) {
          // 시간 초과 시 자동으로 오답 처리
          clearInterval(timer);
          
          // 이미 답변했거나 성공한 경우 타이머 정지
          if (isAnswered) return 0;
          
          setIsAnswered(true);
          setFeedbackMessage("▶ 이미 선택된 좌석입니다.");
          setIsCorrect(false);
          setShowFeedback(true);
          
          submitAnswer(0, false);
          
          nextQuestionTimeoutRef.current = setTimeout(() => {
            if (currentQuestionIndex < TOTAL_ROUNDS - 1) {
              nextQuestion();
            } else {
              const result = finishQuiz();
              navigate('/result', { state: { result, gameType: 'two-in-a-row' } });
            }
            nextQuestionTimeoutRef.current = null;
          }, 2000);
          
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isAnswered, timeLeft, navigate, submitAnswer, nextQuestion, finishQuiz, currentQuestionIndex]);

  // 현재 라운드에 맞는 그리드 크기와 셀 크기 계산
  const currentGridSize = GRID_SIZES[currentQuestionIndex];
  
  // 그리드 영역을 고정 크기로 설정
  const FIXED_GRID_WIDTH = 280;  // 고정 그리드 너비
  const FIXED_GRID_HEIGHT = 280; // 고정 그리드 높이
  
  // 고정된 그리드 크기에 맞춰 셀 크기 계산
  const cellSize = Math.min(
    Math.floor(FIXED_GRID_WIDTH / currentGridSize),
    Math.floor(FIXED_GRID_HEIGHT / currentGridSize)
  );
  
  // 실제 그리드 크기 (셀 크기 * 그리드 크기)
  const actualGridWidth = currentGridSize * cellSize;
  const actualGridHeight = currentGridSize * cellSize;
  
  // 그리드를 중앙에 배치하기 위한 여백 계산
  const marginLeft = (FIXED_GRID_WIDTH - actualGridWidth) / 2;
  const marginTop = (FIXED_GRID_HEIGHT - actualGridHeight) / 2;

  return (
    <div className="min-h-screen flex items-center justify-center p-2">
      <div className="w-full max-w-[355px] h-[600px] flex flex-col">
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
            <span className="text-sm">라운드 {currentQuestionIndex + 1}/{TOTAL_ROUNDS}</span>
            <span className="text-sm text-[#5599FF] font-bold">🎯 2연석 찾기</span>
          </div>
          
          <ProgressBar current={currentQuestionIndex + 1} total={TOTAL_ROUNDS} />
        </div>

        {/* 타이머 */}
        <div className="mb-4 text-center flex-shrink-0">
          <div className="text-3xl font-pixel text-[#FF5555] mb-2">
            {timeLeft.toFixed(1)}초
          </div>
          <div className="w-full bg-[#2A2A3A] h-3 rounded">
            <div 
              className="bg-[#FF5555] h-3 rounded transition-all duration-100"
              style={{ width: `${(timeLeft / TIME_LIMITS[currentQuestionIndex]) * 100}%` }}
            />
          </div>
        </div>

        {/* 게임 영역 */}
        <ConsoleWindow className="mb-4 flex-grow flex flex-col justify-center">
          {currentQuestionData && (
            <>
              {/* 목표 케이스 표시 */}
              <div className="mb-4 text-center">
                <div className="text-sm text-[#E0E0E0]/70 mt-2">
                  {currentGridSize}×{currentGridSize} 그리드
                </div>
              </div>

              {/* 그리드 */}
              <div className="mb-4 flex justify-center items-center w-full h-full overflow-hidden">
                <div 
                  className="relative"
                  style={{
                    width: `${FIXED_GRID_WIDTH}px`,
                    height: `${FIXED_GRID_HEIGHT}px`
                  }}
                >
                  {/* 그리드를 중앙에 배치하기 위한 컨테이너 */}
                  <div
                    className="grid gap-0 absolute"
                    style={{
                      gridTemplateColumns: `repeat(${currentGridSize}, ${cellSize}px)`,
                      gridTemplateRows: `repeat(${currentGridSize}, ${cellSize}px)`,
                      width: `${actualGridWidth}px`,
                      height: `${actualGridHeight}px`,
                      left: `${marginLeft}px`,
                      top: `${marginTop}px`
                    }}
                  >
                    {gridState.map((row, rowIndex) => 
                      row.map((cell, colIndex) => (
                        <button
                          key={`${rowIndex}-${colIndex}`}
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                          disabled={isAnswered || !cell.isOccupied}
                          className={`
                            transition-all duration-150
                            ${cell.isOccupied 
                              ? cell.isSelected
                                ? 'bg-[#FF5555]' // 선택된 셀: 빨간색
                                : 'bg-[#5599FF]' // 일반 셀: 파란색
                              : 'bg-[#2A2A3A]' // 빈 셀: 어두운 색
                            }
                            ${isAnswered ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                          style={{
                            width: `${cellSize}px`,
                            height: `${cellSize}px`
                          }}
                        />
                      ))
                    )}
                  </div>
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
