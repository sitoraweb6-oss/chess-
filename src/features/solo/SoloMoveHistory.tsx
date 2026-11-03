import React, { useRef, useEffect } from 'react';
import { Card } from '../../components/ui/Card.tsx';
import { bn, toBanglaNumeral } from '../../i18n/bn.ts';

export interface SoloMoveHistoryProps {
  moves: string[]; // List of SAN moves e.g. ['e4', 'e5', 'Nf3', 'Nc6']
  currentMoveIndex: number; // 0 = start position, moves.length = latest
  onSelectMoveIndex: (idx: number) => void;
}

export const SoloMoveHistory: React.FC<SoloMoveHistoryProps> = ({
  moves,
  currentMoveIndex,
  onSelectMoveIndex,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Group into pairs: [whiteMove, blackMove]
  const movePairs: { round: number; white: string; black?: string; whiteIdx: number; blackIdx?: number }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      round: Math.floor(i / 2) + 1,
      white: moves[i],
      whiteIdx: i + 1,
      black: moves[i + 1],
      blackIdx: i + 2 <= moves.length ? i + 2 : undefined,
    });
  }

  // Auto-scroll to current move
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moves.length]);

  return (
    <Card variant="surface" className="p-3 sm:p-4 space-y-2 border-border shadow-xs">
      <div className="flex items-center justify-between pb-1.5 border-b border-border text-xs">
        <span className="font-bold text-fg">{bn.solo.moveHistory}</span>
        <span className="text-muted font-mono">
          মোট চাল: {toBanglaNumeral(moves.length)}
        </span>
      </div>

      <div
        ref={scrollRef}
        className="max-h-44 sm:max-h-56 overflow-y-auto pr-1 space-y-1 text-xs select-none scrollbar-thin"
      >
        {movePairs.length === 0 ? (
          <p className="text-muted text-center py-4 text-[11px]">
            {bn.solo.noMovesYet}
          </p>
        ) : (
          movePairs.map((pair) => (
            <div
              key={pair.round}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-surface-2 transition-colors"
            >
              <span className="w-8 font-mono text-muted text-[11px]">
                {toBanglaNumeral(pair.round)}.
              </span>

              {/* White Move button */}
              <button
                type="button"
                onClick={() => onSelectMoveIndex(pair.whiteIdx)}
                className={`flex-1 py-0.5 px-1.5 rounded text-left font-mono font-semibold transition-colors cursor-pointer touch-target ${
                  currentMoveIndex === pair.whiteIdx
                    ? 'bg-primary text-primary-fg'
                    : 'text-fg hover:bg-primary-soft hover:text-primary'
                }`}
              >
                {pair.white}
              </button>

              {/* Black Move button */}
              {pair.black && (
                <button
                  type="button"
                  onClick={() => onSelectMoveIndex(pair.blackIdx!)}
                  className={`flex-1 py-0.5 px-1.5 rounded text-left font-mono font-semibold transition-colors cursor-pointer touch-target ${
                    currentMoveIndex === pair.blackIdx
                      ? 'bg-primary text-primary-fg'
                      : 'text-fg hover:bg-primary-soft hover:text-primary'
                  }`}
                >
                  {pair.black}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
