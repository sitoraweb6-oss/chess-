import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { Sparkles, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { bn } from '../../i18n/bn.ts';
import { ReviewedMove } from '../../storage/index.ts';
import { BOARD_THEMES, BoardThemeColors } from '../../utils/theme.ts';

export interface LessonLearnedCardProps {
  criticalMove: ReviewedMove | null;
  userColor: 'white' | 'black';
  boardThemeColors: BoardThemeColors;
}

export const LessonLearnedCard: React.FC<LessonLearnedCardProps> = ({
  criticalMove,
  userColor,
  boardThemeColors,
}) => {
  const navigate = useNavigate();

  if (!criticalMove) {
    return (
      <Card variant="highlight" className="p-4 sm:p-5 text-center space-y-2 border border-[#1F6F50]/20">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xl">🌟</span>
          <h3 className="font-bold text-sm sm:text-base text-[#1F6F50]">
            {bn.review.lessonLearnedTitle}
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-[#6B726D] max-w-lg mx-auto">
          {bn.review.noMajorBlunderMessage}
        </p>
      </Card>
    );
  }

  const arrows = [];
  if (criticalMove.uci && criticalMove.uci.length >= 4) {
    arrows.push({
      startSquare: criticalMove.uci.slice(0, 2),
      endSquare: criticalMove.uci.slice(2, 4),
      color: '#E53935',
    });
  }
  if (criticalMove.bestLine && criticalMove.bestLine[0] && criticalMove.bestLine[0].length >= 4) {
    arrows.push({
      startSquare: criticalMove.bestLine[0].slice(0, 2),
      endSquare: criticalMove.bestLine[0].slice(2, 4),
      color: '#43A047',
    });
  }

  return (
    <Card variant="surface-2" className="p-4 sm:p-5 space-y-4 border border-[#1F6F50]/25 shadow-soft">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1E2420]/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#E6F2EC] text-[#1F6F50]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-[#1E2420] dark:text-[#EDE8DE]">
              {bn.review.lessonLearnedTitle}
            </h3>
            <p className="text-xs text-[#6B726D]">
              {bn.review.lessonLearnedSubtitle}
            </p>
          </div>
        </div>

        <Badge variant="mistake" size="sm">
          {criticalMove.classification === 'blunder' ? 'সবচেয়ে বড় ব্লান্ডার' : 'সবচেয়ে বড় অসাবধানতা'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Mini Chessboard */}
        <div className="md:col-span-5 flex justify-center">
          <div
            className="w-[200px] h-[200px] sm:w-[220px] sm:h-[220px] rounded-xl overflow-hidden shadow-card border border-[#1E2420]/15"
            style={{ backgroundColor: boardThemeColors.light }}
          >
            <Chessboard
              options={{
                position: criticalMove.fenBefore,
                boardOrientation: userColor,
                arrows,
                darkSquareStyle: { backgroundColor: boardThemeColors.dark },
                lightSquareStyle: { backgroundColor: boardThemeColors.light },
                showNotation: false,
                allowDragging: false,
              }}
            />
          </div>
        </div>

        {/* Moves Comparison & Explanation */}
        <div className="md:col-span-7 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Played move */}
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 space-y-1">
              <span className="text-[11px] font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{bn.review.youPlayedLabel}</span>
              </span>
              <span className="font-bold font-mono text-sm text-[#1E2420] dark:text-[#EDE8DE] block">
                {criticalMove.san}
              </span>
            </div>

            {/* Best move */}
            <div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/40 space-y-1">
              <span className="text-[11px] font-medium text-green-700 dark:text-green-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{bn.review.shouldHavePlayedLabel}</span>
              </span>
              <span className="font-bold font-mono text-sm text-[#1E2420] dark:text-[#EDE8DE] block">
                {criticalMove.bestMoveSan || 'সঠিক চাল'}
              </span>
            </div>
          </div>

          {/* Teacher Explanation */}
          <div className="p-3 rounded-xl bg-white dark:bg-[#1A231E] border border-[#1E2420]/10 text-xs leading-relaxed space-y-1">
            <span className="font-semibold text-[#1F6F50] block">
              {bn.review.whyExplanationLabel}
            </span>
            <p className="text-[#1E2420] dark:text-[#EDE8DE]">
              {criticalMove.explanation || 'এই পজিশনে প্রতিপক্ষের আক্রমণের মুখে সঠিক ঘরে যাওয়া বেশি নিরাপদ ছিল।'}
            </p>
          </div>

          <div className="pt-1 flex justify-end">
            <Button
              onClick={() => navigate('/puzzles')}
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {bn.review.practiceThisMistakeBtn}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
