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
    surface: 'bg-[#FFFDF8] border border-[#1E2420]/8 shadow-card',
    'surface-2': 'bg-[#F4EFE4] border border-[#1E2420]/10 shadow-card',
    highlight: 'bg-[#E6F2EC] border border-[#1F6F50]/25 shadow-card',
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
