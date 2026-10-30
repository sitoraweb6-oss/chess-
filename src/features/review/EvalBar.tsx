import React from 'react';
import { toBanglaNumeral } from '../../i18n/bn.ts';

export interface EvalBarProps {
  cp?: number;
  mate?: number;
  userColor?: 'white' | 'black';
}

export const EvalBar: React.FC<EvalBarProps> = ({
  cp = 0,
  mate,
  userColor = 'white',
}) => {
  // Compute white win percentage (0 to 100)
  let whitePercent = 50;
  let label = '০.০';

  if (typeof mate === 'number') {
    if (mate > 0) {
      whitePercent = 100;
      label = `M${toBanglaNumeral(Math.abs(mate))}`;
    } else if (mate < 0) {
      whitePercent = 0;
      label = `-M${toBanglaNumeral(Math.abs(mate))}`;
    } else {
      whitePercent = 50;
      label = '০.০';
    }
  } else {
    const clampedCp = Math.max(-1000, Math.min(1000, cp));
    // Sigmoid mapping centered at 50%
    whitePercent = 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * clampedCp)) - 1);
    const pawns = (cp / 100).toFixed(1);
    label = cp > 0 ? `+${toBanglaNumeral(pawns)}` : toBanglaNumeral(pawns);
  }

  // If user is black, flip visual representation so user side is at the bottom
  const fillPercent = userColor === 'white' ? whitePercent : 100 - whitePercent;

  return (
    <div
      aria-label={`মূল্যায়ন: ${label}`}
      className="relative flex flex-col justify-end w-7 sm:w-8 h-[320px] sm:h-[400px] bg-[#1E2420] rounded-lg overflow-hidden border border-[#1E2420]/20 shadow-xs select-none shrink-0"
    >
      {/* White portion of the bar */}
      <div
        className="w-full bg-[#FFFDF8] transition-all duration-300 ease-out"
        style={{ height: `${fillPercent}%` }}
      />

      {/* Numerical score label */}
      <div className="absolute inset-x-0 bottom-2 text-center text-[10px] sm:text-xs font-mono font-bold text-[#1E2420] pointer-events-none drop-shadow-xs">
        {label}
      </div>
    </div>
  );
};
