import React from 'react';

interface GameCardProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  comingSoon?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({
  icon,
  title,
  description,
  onClick,
  disabled = false,
  comingSoon = false
}) => {
  return (
    <div 
      className={`game-card flex-shrink-0 ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} ${comingSoon ? 'coming-soon' : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{icon}</div>
      <h3 className="text-xs sm:text-sm font-bold mb-2 sm:mb-3">{title}</h3>
      <p className="text-xs text-console-fg/70 mb-3 sm:mb-4 leading-tight">{description}</p>
      
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
