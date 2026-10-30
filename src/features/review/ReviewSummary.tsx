import React from 'react';
import { Card } from '../../components/ui/Card.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { bn, toBanglaNumeral } from '../../i18n/bn.ts';
import { GameAnalysis } from '../../storage/index.ts';

export interface ReviewSummaryProps {
  analysis: GameAnalysis;
}

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({ analysis }) => {
  const {
    accuracy,
    brilliantCount,
    goodCount,
    inaccuracyCount,
    mistakeCount,
    blunderCount,
  } = analysis;

  // Encouragement line based on accuracy band
  let encouragementText: string = bn.review.encouragement.learning;
  if (accuracy >= 85) {
    encouragementText = bn.review.encouragement.excellent;
  } else if (accuracy >= 70) {
    encouragementText = bn.review.encouragement.great;
  } else if (accuracy >= 50) {
    encouragementText = bn.review.encouragement.good;
  }

  return (
    <Card className="space-y-4 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Accuracy badge & score */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-[#1F6F50] text-[#FFFDF8] flex flex-col items-center justify-center shadow-xs shrink-0">
            <span className="text-lg font-bold font-mono leading-none">
              {toBanglaNumeral(accuracy)}%
            </span>
            <span className="text-[10px] opacity-80 mt-0.5">{bn.review.accuracyLabel}</span>
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#1E2420]">
              {bn.review.summaryTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#6B726D] mt-0.5 leading-snug">
              {encouragementText}
            </p>
          </div>
        </div>

        {/* Quality Counts Chips */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <Badge quality="brilliant">
            {bn.review.qualities.brilliant.icon} {toBanglaNumeral(brilliantCount)}
          </Badge>
          <Badge quality="good">
            {bn.review.qualities.good.icon} {toBanglaNumeral(goodCount)}
          </Badge>
          <Badge quality="inaccuracy">
            {bn.review.qualities.inaccuracy.icon} {toBanglaNumeral(inaccuracyCount)}
          </Badge>
          <Badge quality="mistake">
            {bn.review.qualities.mistake.icon} {toBanglaNumeral(mistakeCount)}
          </Badge>
          <Badge quality="blunder">
            {bn.review.qualities.blunder.icon} {toBanglaNumeral(blunderCount)}
          </Badge>
        </div>
      </div>
    </Card>
  );
};
