import React from 'react';
import { Sparkles, PlayCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { bn } from '../../i18n/bn.ts';
import { ReviewedMove } from '../../storage/index.ts';

export interface ExplanationCardProps {
  move: ReviewedMove | null;
  onShowBestLine: () => void;
  isPlayingLine?: boolean;
}

export const ExplanationCard: React.FC<ExplanationCardProps> = ({
  move,
  onShowBestLine,
  isPlayingLine = false,
}) => {
  if (!move) {
    return (
      <Card variant="surface-2" className="p-4 text-center">
        <p className="text-sm text-[#6B726D]">{bn.review.noMovesToReview}</p>
      </Card>
    );
  }

  const isMistake =
    move.classification === 'inaccuracy' ||
    move.classification === 'mistake' ||
    move.classification === 'blunder';

  const qualityInfo = move.classification
    ? bn.review.qualities[move.classification]
    : null;

  return (
    <Card variant="surface" className="p-4 sm:p-5 space-y-3 border-[#1E2420]/15">
      {/* Header: Move SAN + Quality Badge */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-[#1E2420]/10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-[#6B726D]">
            {move.isUser ? 'তোমার চাল:' : 'প্রতিপক্ষের চাল:'}
          </span>
          <span className="text-base font-bold font-mono text-[#1E2420]">
            {move.san}
          </span>
        </div>

        {qualityInfo && (
          <Badge quality={move.classification} icon={<span>{qualityInfo.icon}</span>}>
            {qualityInfo.label}
          </Badge>
        )}
      </div>

      {/* Teacher Explanation Prose */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1F6F50]">
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>{bn.review.teacherSaid}</span>
        </div>
        <p className="text-sm text-[#1E2420] leading-relaxed">
          {move.explanation || 'এই চালটি সঠিক গতিশীলতা বজায় রেখেছে।'}
        </p>
      </div>

      {/* Action for mistakes: "সঠিক চালটা দেখাও" */}
      {isMistake && move.evalBefore?.bestMove && (
        <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#1E2420]/10">
          <div className="text-xs text-[#6B726D]">
            <span>{bn.review.bestMove}: </span>
            <span className="font-mono font-semibold text-[#1F6F50]">
              {move.bestMoveSan || move.evalBefore.bestMove}
            </span>
          </div>

          <Button
            onClick={onShowBestLine}
            isLoading={isPlayingLine}
            variant="secondary"
            size="sm"
            leftIcon={<PlayCircle className="w-4 h-4 text-[#1F6F50]" />}
          >
            {isPlayingLine ? bn.review.showingLine : bn.review.showBestLine}
          </Button>
        </div>
      )}
    </Card>
  );
};
