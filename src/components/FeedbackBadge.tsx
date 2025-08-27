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
    <div className={`feedback-badge ${isCorrect ? 'feedback-correct' : 'feedback-wrong'} ${className} whitespace-pre-line`}>
      {message}
    </div>
  );
};
