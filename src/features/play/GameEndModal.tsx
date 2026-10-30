import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Frown, Scale, Sparkles, RotateCcw, Home } from 'lucide-react';
import { Modal } from '../../components/ui/Modal.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { bn, toBanglaNumeral } from '../../i18n/bn.ts';

export interface GameEndModalProps {
  isOpen: boolean;
  result: 'win' | 'loss' | 'draw';
  reasonText: string;
  gameId: string;
  ratingChange: number;
  newRating: number;
  onPlayAgain: () => void;
}

export const GameEndModal: React.FC<GameEndModalProps> = ({
  isOpen,
  result,
  reasonText,
  gameId,
  ratingChange,
  newRating,
  onPlayAgain,
}) => {
  const navigate = useNavigate();

  const titleMap = {
    win: bn.play.gameEnd.winTitle,
    loss: bn.play.gameEnd.lossTitle,
    draw: bn.play.gameEnd.drawTitle,
  };

  const iconMap = {
    win: (
      <div className="w-16 h-16 mx-auto bg-primary-soft text-primary rounded-2xl flex items-center justify-center text-3xl shadow-sm mb-3">
        <Trophy className="w-8 h-8 text-primary" />
      </div>
    ),
    loss: (
      <div className="w-16 h-16 mx-auto bg-danger-soft text-danger rounded-2xl flex items-center justify-center text-3xl shadow-sm mb-3">
        <Frown className="w-8 h-8 text-accent" />
      </div>
    ),
    draw: (
      <div className="w-16 h-16 mx-auto bg-surface-2 text-muted rounded-2xl flex items-center justify-center text-3xl shadow-sm mb-3">
        <Scale className="w-8 h-8 text-muted" />
      </div>
    ),
  };

  const handleReview = () => {
    navigate(`/review/${gameId}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="" maxWidth="md">
      <div className="text-center py-2">
        {iconMap[result]}

        <h3 className="text-xl font-bold text-fg mb-2">{titleMap[result]}</h3>
        <p className="text-sm text-muted max-w-sm mx-auto mb-4">{reasonText}</p>

        {/* Rating summary */}
        <div className="bg-surface-2/70 rounded-xl p-3 mb-6 inline-flex items-center gap-4 border border-border">
          <div className="text-left">
            <span className="text-xs text-muted block">{bn.play.gameEnd.ratingChange}</span>
            <span
              className={`text-sm font-bold font-mono ${
                ratingChange > 0
                  ? 'text-success'
                  : ratingChange < 0
                  ? 'text-danger'
                  : 'text-muted'
              }`}
            >
              {ratingChange > 0 ? `+${toBanglaNumeral(ratingChange)}` : toBanglaNumeral(ratingChange)}
            </span>
          </div>
          <div className="h-7 w-px bg-border" />
          <div className="text-left">
            <span className="text-xs text-muted block">{bn.home.currentRating}</span>
            <span className="text-sm font-bold font-mono text-fg">
              {toBanglaNumeral(newRating)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <Button
            onClick={handleReview}
            variant="primary"
            size="lg"
            className="w-full"
            leftIcon={<Sparkles className="w-5 h-5 fill-current" />}
          >
            {bn.play.gameEnd.btnReview}
          </Button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              onClick={onPlayAgain}
              variant="secondary"
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              {bn.play.gameEnd.btnPlayAgain}
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              leftIcon={<Home className="w-4 h-4" />}
            >
              {bn.play.gameEnd.btnHome}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
