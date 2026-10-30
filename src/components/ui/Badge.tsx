import React from 'react';
import { MoveClassification } from '../../storage/index.ts';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  quality?: MoveClassification;
  variant?: 'neutral' | 'accent' | 'primary' | 'good' | 'mistake' | 'blunder';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  quality,
  variant = 'neutral',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  let styleClasses = 'bg-surface-2 text-app border border-app';

  const effectiveQuality = quality || (variant === 'good' || variant === 'mistake' || variant === 'blunder' ? variant : undefined);

  if (effectiveQuality) {
    switch (effectiveQuality) {
      case 'brilliant':
        styleClasses = 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-semibold';
        break;
      case 'good':
        styleClasses = 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-semibold';
        break;
      case 'inaccuracy':
        styleClasses = 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-semibold';
        break;
      case 'mistake':
        styleClasses = 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border border-orange-500/30 font-semibold';
        break;
      case 'blunder':
        styleClasses = 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30 font-semibold';
        break;
    }
  } else if (variant === 'accent') {
    styleClasses = 'bg-accent-soft text-accent border border-accent/30 font-medium';
  } else if (variant === 'primary') {
    styleClasses = 'bg-primary-soft text-primary-themed border border-primary/30 font-medium';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full leading-normal select-none ${sizeClasses} ${styleClasses} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
