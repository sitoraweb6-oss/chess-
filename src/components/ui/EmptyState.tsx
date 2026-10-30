import React from 'react';
import { Button } from './Button.tsx';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-surface-2/50 rounded-xl border border-dashed border-border">
      {icon && <div className="p-3 mb-3 text-primary bg-primary-soft rounded-full">{icon}</div>}
      <h3 className="text-lg font-semibold text-fg mb-1">{title}</h3>
      <p className="text-sm text-muted max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
