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
        <div className="text-center p-6 bg-gradient-to-b from-primary-soft to-surface rounded-2xl border border-primary/20">
          <div className="w-16 h-16 mx-auto bg-primary text-primary-fg rounded-2xl flex items-center justify-center text-3xl shadow-md mb-3">
            👑
          </div>
          <span className="text-xs text-muted font-medium block">
            {bn.placement.estimatedRatingLabel}
          </span>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-4xl font-extrabold font-mono text-primary">
              {toBanglaNumeral(resultData.estimatedRating)}
            </span>
            <Badge variant="accent" size="sm">
              {bn.home.provisionalBadge}
            </Badge>
          </div>
          <p className="text-xs text-muted mt-2 max-w-sm mx-auto">
            {bn.placement.provisionalNote}
          </p>
        </div>

        {/* Strengths & Weaknesses Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card variant="surface-2" className="p-3.5 space-y-1.5 border-l-4 border-l-success">
            <span className="text-xs font-semibold text-success flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>{bn.placement.topStrengthLabel}</span>
            </span>
            <p className="text-xs font-medium text-fg">
              {resultData.topStrengthBn}
            </p>
          </Card>

          <Card variant="surface-2" className="p-3.5 space-y-1.5 border-l-4 border-l-accent">
            <span className="text-xs font-semibold text-accent flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>{bn.placement.topWeaknessLabel}</span>
            </span>
            <p className="text-xs font-medium text-fg">
              {resultData.topWeaknessBn}
            </p>
          </Card>
        </div>

        {/* Friendly teacher feedback */}
        <Card variant="highlight" className="p-4 text-xs text-fg leading-relaxed">
          <div className="flex items-start gap-2.5">
            <span className="text-xl shrink-0">💡</span>
            <div>
              <span className="font-bold block text-sm mb-1 text-primary">
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
