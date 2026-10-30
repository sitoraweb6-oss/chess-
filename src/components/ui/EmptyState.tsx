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
    <div className="flex flex-col items-center justify-center p-8 text-center bg-[#F4EFE4]/50 rounded-xl border border-dashed border-[#1E2420]/15">
      {icon && <div className="p-3 mb-3 text-[#1F6F50] bg-[#E6F2EC] rounded-full">{icon}</div>}
      <h3 className="text-lg font-semibold text-[#1E2420] mb-1">{title}</h3>
      <p className="text-sm text-[#6B726D] max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
