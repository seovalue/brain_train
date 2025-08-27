import React from 'react';

interface ConsoleWindowProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const ConsoleWindow: React.FC<ConsoleWindowProps> = ({ 
  children, 
  className = '', 
  title 
}) => {
  return (
    <div className={`console-window p-4 ${className}`}>
      {title && (
        <div className="text-center mb-4 text-lg font-bold border-b-2 border-console-fg pb-2">
          {title}
        </div>
      )}
      {children}
    </div>
  );
};
