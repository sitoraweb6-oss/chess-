import React from 'react';
import { toBanglaNumeral } from '../../i18n/bn.ts';

export interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showNumbers?: boolean;
  color?: 'primary' | 'accent' | 'good';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  label,
  showNumbers = true,
  color = 'primary',
}) => {
  const safeTotal = Math.max(1, total);
  const clampedCurrent = Math.min(safeTotal, Math.max(0, current));
  const percent = Math.round((clampedCurrent / safeTotal) * 100);

  const colorClasses = {
    primary: 'bg-[#1F6F50]',
    accent: 'bg-[#E0A43A]',
    good: 'bg-[#43A047]',
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm">
        {label && <span className="font-medium text-[#1E2420]">{label}</span>}
        {showNumbers && (
          <span className="font-mono text-xs text-[#6B726D]">
            {toBanglaNumeral(clampedCurrent)} / {toBanglaNumeral(safeTotal)} ({toBanglaNumeral(percent)}%)
          </span>
        )}
      </div>
      <div
        role="progressbar"
        aria-valuenow={clampedCurrent}
        aria-valuemin={0}
        aria-valuemax={safeTotal}
        className="w-full h-3 bg-[#F4EFE4] rounded-full overflow-hidden border border-[#1E2420]/10"
      >
        <div
          className={`h-full transition-all duration-300 ease-out rounded-full ${colorClasses[color]}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
