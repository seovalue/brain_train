import React from 'react';

interface GameListItemProps {
  icon: string;
  title: string;
  description: string;
  disabled?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard'
  isNew?: boolean;
  onClick: () => void;
}

export const GameListItem: React.FC<GameListItemProps> = ({
  icon,
  title,
  description,
  disabled = false,
  difficulty,
  isNew = false,
  onClick,
}) => {
  const cleanTitle = title.replace(/\n/g, ' ').trim();
  const cleanDesc = description.replace(/\n/g, ' ').trim();
  return (
    <div
      className={`w-full ${disabled ? 'opacity-60' : 'cursor-pointer'} select-none mx-1`}
      onClick={disabled ? undefined : onClick}
      role={!disabled ? 'button' : undefined}
      tabIndex={!disabled ? 0 : -1}
      onKeyDown={(e) => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) onClick(); }}
    >
      <div
        className="flex items-center justify-between p-[5px] border-2 bg-console-bg h-16"
        style={{ borderColor: '#303046' }}
      >
        <div className="flex items-center min-w-0" style={{ gap: '10px' }}>
          <div className="text-2xl flex-shrink-0">{icon}</div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold leading-tight truncate">{cleanTitle}</div>
            <div className="text-[10px] sm:text-xs text-console-fg/70 leading-tight truncate">{cleanDesc}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 pl-2">
          {isNew && (
            <span className="text-[10px] font-bold px-1" style={{ background: '#88FF88', color: '#000' }}>NEW</span>
          )}
          {difficulty === 'hard' && (
            <span className="text-[10px] font-bold px-1" style={{ background: '#dc2626', color: '#fff' }}>HARD</span>
          )}
          <span className="text-console-fg/60 text-sm">›</span>
        </div>
      </div>
    </div>
  );
};
