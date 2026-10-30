import React from 'react';
import { MoveClassification } from '../../storage/index.ts';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  quality?: MoveClassification;
  variant?: 'neutral' | 'accent' | 'primary';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  quality,
  variant = 'neutral',
  icon,
  className = '',
  ...props
}) => {
  let styleClasses = 'bg-[#F4EFE4] text-[#1E2420] border border-[#1E2420]/10';

  if (quality) {
    switch (quality) {
      case 'brilliant':
        styleClasses = 'bg-[#E3F2FD] text-[#1E88E5] border border-[#1E88E5]/30 font-semibold';
        break;
      case 'good':
        styleClasses = 'bg-[#E8F5E9] text-[#2E7D32] border border-[#43A047]/30 font-semibold';
        break;
      case 'inaccuracy':
        styleClasses = 'bg-[#FFF8E1] text-[#C47D00] border border-[#F9A825]/40 font-semibold';
        break;
      case 'mistake':
        styleClasses = 'bg-[#FFF3E0] text-[#D84315] border border-[#FB8C00]/40 font-semibold';
        break;
      case 'blunder':
        styleClasses = 'bg-[#FFEBEE] text-[#C62828] border border-[#E53935]/40 font-semibold';
        break;
    }
  } else if (variant === 'accent') {
    styleClasses = 'bg-[#FDF6E9] text-[#B87D1B] border border-[#E0A43A]/30 font-medium';
  } else if (variant === 'primary') {
    styleClasses = 'bg-[#E6F2EC] text-[#1F6F50] border border-[#1F6F50]/30 font-medium';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs leading-normal select-none ${styleClasses} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
