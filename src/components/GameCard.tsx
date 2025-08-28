import React from 'react';

interface GameCardProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  comingSoon?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard'
  isNew?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({
  icon,
  title,
  description,
  onClick,
  disabled = false,
  comingSoon = false,
  difficulty,
  isNew = false,
}) => {
  return (
    <div 
      className={`game-card flex-shrink-0 ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} ${comingSoon ? 'coming-soon' : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">
        {difficulty === 'hard' ? (
          <div className="bg-red-600 text-white text-xs px-2 py-1 rounded font-bold border border-red-700 shadow-sm" style={{backgroundColor: '#dc2626', color: 'white'}}>
            고난이도
          </div>
        ) : isNew ? (
          <div className="bg-yellow-500 text-black text-xs px-2 py-1 rounded font-bold border border-yellow-600 shadow-sm" style={{backgroundColor: '#88FF88', color: 'black'}}>
            신규 게임!
          </div>
        ) : (
          icon
        )}
      </div>
      <h3 className="text-xs sm:text-sm font-bold mb-0.5 sm:mb-1 whitespace-pre-line">{title}</h3>
      <p className="text-xs text-console-fg/70 mb-3 sm:mb-4 leading-tight whitespace-pre-line">{description}</p>
      
      {comingSoon ? (
        <div className="text-center">
          <div className="text-xs text-gray-400 animate-pulse">🚧 준비중</div>
        </div>
      ) : (
        <button 
          className={`pixel-button w-full text-xs py-3 sm:py-4 ${disabled ? 'disabled' : ''}`}
          disabled={disabled}
        >
          시작하기
        </button>
      )}
    </div>
  );
};
