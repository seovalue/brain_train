import React from 'react';

interface KeypadProps {
  onNumberClick: (num: number) => void;
  onClear: () => void;
  onSubmit: () => void;
  submitDisabled?: boolean;
}

export const Keypad: React.FC<KeypadProps> = ({
  onNumberClick,
  onClear,
  onSubmit,
  submitDisabled = false
}) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  return (
    <div className="keypad-grid">
      {numbers.slice(0, 9).map((num) => (
        <button
          key={num}
          className="pixel-button text-lg"
          onClick={() => onNumberClick(num)}
        >
          {num}
        </button>
      ))}
      
      <button
        className="pixel-button text-lg"
        onClick={onClear}
      >
        지우기
      </button>
      
      <button
        className="pixel-button text-lg"
        onClick={() => onNumberClick(0)}
      >
        0
      </button>
      
      <button
        className={`pixel-button text-lg ${submitDisabled ? 'disabled' : ''}`}
        onClick={onSubmit}
        disabled={submitDisabled}
      >
        제출
      </button>
    </div>
  );
};
