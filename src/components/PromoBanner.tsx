import React from 'react';

interface PromoBannerProps {
  icon: string;
  title: string;
  description?: string;
  cta?: string;
  onClick: () => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ icon, title, description, cta = 'PLAY', onClick }) => {
  const cleanTitle = title.replace(/\n/g, ' ').trim();
  const cleanDesc = (description ?? '').replace(/\n/g, ' ').trim();
  return (
    <div className="mb-4 sm:mb-6 md:mb-8">
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
        className="relative cursor-pointer transition-all duration-200 group select-none"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: '3px solid #FFD93D',
          borderRadius: '0px',
          boxShadow: '4px 4px 0px #000000',
          padding: '12px'
        }}
      >
        <div
          className="absolute text-[10px] font-bold px-1 py-0.5"
          style={{
            top: 2,
            right: 2,
            background: '#FF6B6B',
            color: '#FFFFFF',
            border: '1px solid #FFFFFF',
            borderRadius: '0px',
            textShadow: '1px 1px 0px #000000',
            zIndex: 10,
            pointerEvents: 'none'
          }}
        >
          NEW
        </div>

        <div
          className="items-center"
          style={{ display: 'grid', gridTemplateColumns: '28px 1fr auto', columnGap: '10px', paddingRight: '8px' }}
        >
          <div
            className="text-2xl sm:text-3xl flex items-center justify-center"
            style={{ width: 28, height: 28, filter: 'drop-shadow(2px 2px 0px #000000)', animation: 'bounce 2s infinite' }}
          >
            {icon}
          </div>
          <div className="min-w-0" style={{ marginTop: '2px' }}>
            <div
              className="text-sm sm:text-base font-bold leading-tight"
              style={{
                color: '#FFFFFF',
                textShadow: '2px 2px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000',
                fontFamily: 'Press Start 2P, monospace',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {cleanTitle}
            </div>
            {cleanDesc && (
              <div className="text-[10px] sm:text-xs text-console-fg/90 mt-1 truncate">
                {cleanDesc}
              </div>
            )}
          </div>
          <div
            className="text-xs font-bold px-3 py-2 group-hover:animate-pulse justify-self-end"
            style={{
              background: '#4ECDC4',
              color: '#000000',
              border: '2px solid #FFFFFF',
              borderRadius: '0px',
              textShadow: 'none',
              fontFamily: 'Press Start 2P, monospace'
            }}
          >
            {cta}
          </div>
        </div>
      </div>
    </div>
  );
};
