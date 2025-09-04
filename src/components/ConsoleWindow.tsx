import React from 'react';

interface ConsoleWindowProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  contentClassName?: string;
  style?: React.CSSProperties;
}

export const ConsoleWindow: React.FC<ConsoleWindowProps> = ({ 
  children, 
  className = '', 
  title,
  contentClassName = '',
  style,
}) => {
  return (
    <div className={`console-window p-4 ${className}`} style={style}>
      {title && (
        <div className="text-center mb-4 text-lg font-bold border-b-2 border-console-fg pb-2">
          {title}
        </div>
      )}
      {contentClassName ? (
        <div className={contentClassName}>{children}</div>
      ) : (
        <>{children}</>
      )}
    </div>
  );
};
