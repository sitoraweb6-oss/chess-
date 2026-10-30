import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'surface-2' | 'highlight';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'surface',
  className = '',
  ...props
}) => {
  const variantClasses = {
    surface: 'bg-surface border border-border shadow-card text-fg',
    'surface-2': 'bg-surface-2 border border-border shadow-card text-fg',
    highlight: 'bg-primary-soft border border-border shadow-card text-fg',
  };

  return (
    <div
      className={`rounded-xl p-4 sm:p-5 transition-shadow duration-200 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
