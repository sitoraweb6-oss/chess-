import React from 'react';
import {
  Lightbulb,
  Undo2,
  Redo2,
  RotateCw,
  RotateCcw,
  BarChart3,
  Copy,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.tsx';
import { bn } from '../../i18n/bn.ts';

export interface SoloControlsProps {
  isHintLoading: boolean;
  canUndo: boolean;
  canRedo: boolean;
  showEvalBar: boolean;
  autoFlip: boolean;
  onGetBestHint: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onFlipBoard: () => void;
  onToggleAutoFlip: () => void;
  onToggleEvalBar: () => void;
  onNewGame: () => void;
  onCopyPgn: () => void;
}

export const SoloControls: React.FC<SoloControlsProps> = ({
  isHintLoading,
  canUndo,
  canRedo,
  showEvalBar,
  autoFlip,
  onGetBestHint,
  onUndo,
  onRedo,
  onFlipBoard,
  onToggleAutoFlip,
  onToggleEvalBar,
  onNewGame,
  onCopyPgn,
}) => {
  return (
    <div className="space-y-2.5">
      {/* Primary Big Action: Unlimited Best Hint Button */}
      <Button
        onClick={onGetBestHint}
        isLoading={isHintLoading}
        variant="primary"
        size="lg"
        className="w-full shadow-md justify-center font-bold text-base py-3"
        leftIcon={<Lightbulb className="w-5 h-5 fill-current text-accent" />}
      >
        <span>{bn.solo.getBestHintBtn}</span>
        <span className="text-xs font-normal opacity-90 ml-1">
          ({bn.solo.unlimitedHintsDesc})
        </span>
      </Button>

      {/* Row 1: Core Navigation & Move Buttons */}
      <div className="grid grid-cols-4 gap-2">
        <Button
          onClick={onUndo}
          disabled={!canUndo}
          variant="secondary"
          size="sm"
          className="flex-col py-2 px-1 text-xs gap-1 min-h-[48px]"
          title={bn.solo.undoMove}
        >
          <Undo2 className="w-4 h-4 text-primary" />
          <span>{bn.solo.undoMove}</span>
        </Button>

        <Button
          onClick={onRedo}
          disabled={!canRedo}
          variant="secondary"
          size="sm"
          className="flex-col py-2 px-1 text-xs gap-1 min-h-[48px]"
          title={bn.solo.redoMove}
        >
          <Redo2 className="w-4 h-4 text-primary" />
          <span>{bn.solo.redoMove}</span>
        </Button>

        <Button
          onClick={onFlipBoard}
          variant="secondary"
          size="sm"
          className="flex-col py-2 px-1 text-xs gap-1 min-h-[48px]"
          title={bn.solo.flipBoard}
        >
          <RotateCw className="w-4 h-4 text-accent" />
          <span>{bn.solo.flipBoard}</span>
        </Button>

        <Button
          onClick={onNewGame}
          variant="ghost"
          size="sm"
          className="flex-col py-2 px-1 text-xs gap-1 min-h-[48px]"
          title={bn.solo.newGame}
        >
          <RotateCcw className="w-4 h-4 text-muted" />
          <span>{bn.solo.newGame}</span>
        </Button>
      </div>

      {/* Row 2: Secondary Tools (Eval bar, Auto-flip, PGN copy) */}
      <div className="flex items-center justify-between text-xs pt-1 px-1 text-muted">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleEvalBar}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer touch-target ${
              showEvalBar
                ? 'border-primary bg-primary-soft text-primary font-medium'
                : 'border-border bg-surface hover:bg-surface-2 text-muted'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{bn.solo.showEvalBar}</span>
          </button>

          <button
            onClick={onToggleAutoFlip}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer touch-target ${
              autoFlip
                ? 'border-primary bg-primary-soft text-primary font-medium'
                : 'border-border bg-surface hover:bg-surface-2 text-muted'
            }`}
          >
            <span>{bn.solo.autoFlipToggle}</span>
          </button>
        </div>

        <button
          onClick={onCopyPgn}
          className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-surface-2 text-muted hover:text-fg transition-colors cursor-pointer touch-target"
          title={bn.solo.copyPgn}
        >
          <Copy className="w-3.5 h-3.5" />
          <span>{bn.solo.copyPgn}</span>
        </button>
      </div>
    </div>
  );
};
