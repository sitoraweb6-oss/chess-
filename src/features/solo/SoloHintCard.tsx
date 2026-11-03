import React from 'react';
import { Sparkles, Play, X, Lightbulb } from 'lucide-react';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { BestMoveExplanation } from '../../domain/bestMoveExplanation.ts';
import { bn } from '../../i18n/bn.ts';

export interface SoloHintCardProps {
  hint: BestMoveExplanation | null;
  onApplyHintMove: () => void;
  onClearHint: () => void;
}

export const SoloHintCard: React.FC<SoloHintCardProps> = ({
  hint,
  onApplyHintMove,
  onClearHint,
}) => {
  if (!hint) return null;

  return (
    <Card
      variant="highlight"
      className="p-4 sm:p-5 space-y-3.5 border-primary/30 shadow-card animate-fadeIn"
    >
      {/* Header: Badge, Move SAN, Close button */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-primary text-primary-fg">
            <Lightbulb className="w-4 h-4 fill-current text-accent" />
          </div>
          <div>
            <span className="text-xs font-semibold text-primary block">
              {bn.solo.hintCardTitle}
            </span>
            <span className="text-xs text-muted">
              {hint.advantageBn}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" size="md" className="font-mono font-bold text-sm">
            <span className="text-base mr-1">{hint.pieceSymbol}</span>
            <span>{hint.san}</span>
          </Badge>

          <button
            onClick={onClearHint}
            aria-label={bn.solo.clearHint}
            className="p-1 text-muted hover:text-fg hover:bg-surface-2 rounded-lg transition-colors cursor-pointer touch-target"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Explanation text in Bangla */}
      <div className="space-y-1">
        <span className="text-xs font-bold text-fg flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>{bn.solo.whyBestMove}</span>
        </span>
        <p className="text-sm text-fg/90 leading-relaxed">
          {hint.explanation}
        </p>
      </div>

      {/* Apply hint move button */}
      <div className="pt-1 flex items-center justify-between gap-3">
        <span className="text-xs text-muted">
          চাল: <strong className="text-primary font-mono">{hint.moveBn}</strong>
        </span>

        <Button
          onClick={onApplyHintMove}
          variant="primary"
          size="sm"
          className="shadow-sm"
          leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
        >
          {bn.solo.playThisMoveBtn}
        </Button>
      </div>
    </Card>
  );
};
