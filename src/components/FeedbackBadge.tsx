import React from 'react';

interface FeedbackBadgeProps {
  isCorrect: boolean;
  message: string;
  className?: string;
}

export const FeedbackBadge: React.FC<FeedbackBadgeProps> = ({
  isCorrect,
  message,
  className = ''
}) => {
  return (
    <div 
      className={`feedback-badge ${isCorrect ? 'feedback-correct' : 'feedback-wrong'} ${className} whitespace-pre-line text-xl font-bold`}
      style={{
        fontSize: '1.25rem',
        fontWeight: 'bold',
        textShadow: '2px 2px 0px rgba(0,0,0,0.8)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(4px)',
        backgroundColor: 'rgba(28, 28, 42, 0.95)'
      }}
    >
      {message}
    </div>
  );
};
