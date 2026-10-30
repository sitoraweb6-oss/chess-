import React from 'react';
import { Trophy, Sparkles, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';
import { Modal } from '../../components/ui/Modal.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { Card } from '../../components/ui/Card.tsx';
import { bn, toBanglaNumeral } from '../../i18n/bn.ts';
import { PlacementRatingResult } from '../../domain/placement.ts';

export interface PlacementResultModalProps {
  isOpen: boolean;
  resultData: PlacementRatingResult | null;
  onContinue: () => void;
}

export const PlacementResultModal: React.FC<PlacementResultModalProps> = ({
  isOpen,
  resultData,
  onContinue,
}) => {
  if (!resultData) return null;

  return (
    <Modal isOpen={isOpen} onClose={onContinue} title={bn.placement.resultTitle} maxWidth="md">
      <div className="space-y-5 py-2">
        {/* Rating Hero Card */}
        <div className="text-center p-6 bg-gradient-to-b from-[#E6F2EC] to-[#FFFDF8] dark:from-[#1F6F50]/20 dark:to-transparent rounded-2xl border border-[#1F6F50]/20">
          <div className="w-16 h-16 mx-auto bg-[#1F6F50] text-white rounded-2xl flex items-center justify-center text-3xl shadow-md mb-3">
            👑
          </div>
          <span className="text-xs text-[#6B726D] font-medium block">
            {bn.placement.estimatedRatingLabel}
          </span>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-4xl font-extrabold font-mono text-[#1F6F50] dark:text-[#E6F2EC]">
              {toBanglaNumeral(resultData.estimatedRating)}
            </span>
            <Badge variant="accent" size="sm">
              {bn.home.provisionalBadge}
            </Badge>
          </div>
          <p className="text-xs text-[#6B726D] mt-2 max-w-sm mx-auto">
            {bn.placement.provisionalNote}
          </p>
        </div>

        {/* Strengths & Weaknesses Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card variant="surface-2" className="p-3.5 space-y-1.5 border-l-4 border-l-[#43A047]">
            <span className="text-xs font-semibold text-[#43A047] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>{bn.placement.topStrengthLabel}</span>
            </span>
            <p className="text-xs font-medium text-[#1E2420] dark:text-[#EDE8DE]">
              {resultData.topStrengthBn}
            </p>
          </Card>

          <Card variant="surface-2" className="p-3.5 space-y-1.5 border-l-4 border-l-[#FB8C00]">
            <span className="text-xs font-semibold text-[#FB8C00] flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>{bn.placement.topWeaknessLabel}</span>
            </span>
            <p className="text-xs font-medium text-[#1E2420] dark:text-[#EDE8DE]">
              {resultData.topWeaknessBn}
            </p>
          </Card>
        </div>

        {/* Friendly teacher feedback */}
        <Card variant="highlight" className="p-4 text-xs text-[#1E2420] dark:text-[#EDE8DE] leading-relaxed">
          <div className="flex items-start gap-2.5">
            <span className="text-xl shrink-0">💡</span>
            <div>
              <span className="font-bold block text-sm mb-1 text-[#1F6F50]">
                শিক্ষকের বার্তা:
              </span>
              <span>{resultData.summaryBn}</span>
            </div>
          </div>
        </Card>

        {/* Action Button */}
        <div className="pt-2">
          <Button
            onClick={onContinue}
            variant="primary"
            size="lg"
            className="w-full shadow-md"
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            {bn.placement.btnStartCoaching}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
