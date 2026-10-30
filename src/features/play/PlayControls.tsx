import React from 'react';
import { Lightbulb, Undo2, Flag, RotateCcw } from 'lucide-react';
import { Button } from '../../components/ui/Button.tsx';
import { bn, toBanglaNumeral } from '../../i18n/bn.ts';

export interface PlayControlsProps {
  hintsLeft: number;
  undosLeft: number;
  isBotThinking?: boolean;
  isGameOver?: boolean;
  isUserTurn?: boolean;
  onHint: () => void;
  onUndo: () => void;
  onResign: () => void;
  onNewGame: () => void;
}

export const PlayControls: React.FC<PlayControlsProps> = ({
  hintsLeft,
  undosLeft,
  isBotThinking = false,
  isGameOver = false,
  isUserTurn = true,
  onHint,
  onUndo,
  onResign,
  onNewGame,
}) => {
  return (
    <div className="grid grid-cols-4 gap-2 pt-1">
      <Button
        onClick={onHint}
        disabled={hintsLeft <= 0 || isBotThinking || isGameOver}
        variant="secondary"
        size="sm"
        className="flex-col py-2 px-1 text-xs gap-1 min-h-[52px]"
      >
        <Lightbulb className="w-4 h-4 text-accent" />
        <span>{bn.play.controls.hint} ({toBanglaNumeral(hintsLeft)})</span>
      </Button>

      <Button
        onClick={onUndo}
        disabled={undosLeft <= 0 || isBotThinking || isGameOver}
        variant="secondary"
        size="sm"
        className="flex-col py-2 px-1 text-xs gap-1 min-h-[52px]"
      >
        <Undo2 className="w-4 h-4 text-primary" />
        <span>{bn.play.controls.undo} ({toBanglaNumeral(undosLeft)})</span>
      </Button>

      <Button
        onClick={onResign}
        disabled={isGameOver || isBotThinking}
        variant="ghost"
        size="sm"
        className="flex-col py-2 px-1 text-xs gap-1 min-h-[52px] text-danger hover:bg-danger-soft"
      >
        <Flag className="w-4 h-4" />
        <span>{bn.play.controls.resign}</span>
      </Button>

      <Button
        onClick={onNewGame}
        variant="ghost"
        size="sm"
        className="flex-col py-2 px-1 text-xs gap-1 min-h-[52px]"
      >
        <RotateCcw className="w-4 h-4" />
        <span>{bn.play.controls.newGame}</span>
      </Button>
    </div>
  );
};
