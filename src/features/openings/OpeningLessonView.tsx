import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Chess, Square } from 'chess.js';
import { Chessboard, Arrow } from 'react-chessboard';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  Trophy,
  Play,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { ChessOpening, OpeningTrap } from '../../domain/openings.ts';
import { updateOpeningProgress, getOpeningProgress } from '../../storage/index.ts';
import { bn, toBanglaNumeral } from '../../i18n/bn.ts';

export interface OpeningLessonViewProps {
  opening: ChessOpening;
  onSwitchToPractice: () => void;
}

export const OpeningLessonView: React.FC<OpeningLessonViewProps> = ({
  opening,
  onSwitchToPractice,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [activeTrap, setActiveTrap] = useState<OpeningTrap | null>(null);
  const [trapStepIndex, setTrapStepIndex] = useState<number>(0);
  const [isLessonCompleted, setIsLessonCompleted] = useState<boolean>(() => {
    return getOpeningProgress(opening.id).completedLesson;
  });

  // Reset indices when opening changes
  useEffect(() => {
    setCurrentStepIndex(0);
    setActiveTrap(null);
    setTrapStepIndex(0);
    setIsLessonCompleted(getOpeningProgress(opening.id).completedLesson);
  }, [opening.id]);

  // Compute positions for main line
  const mainLinePositions = useMemo(() => {
    const positions: { fen: string; lastMoveArrow?: Arrow }[] = [];
    const chess = new Chess();
    positions.push({ fen: chess.fen() }); // initial position

    for (const m of opening.moves) {
      try {
        const moveRes = chess.move(m.san);
        if (moveRes) {
          positions.push({
            fen: chess.fen(),
            lastMoveArrow: {
              startSquare: moveRes.from,
              endSquare: moveRes.to,
              color: '#1F6F50',
            },
          });
        }
      } catch (err) {
        console.warn('Error applying move in lesson view:', err);
      }
    }
    return positions;
  }, [opening]);

  // Compute positions for active trap
  const trapPositions = useMemo(() => {
    if (!activeTrap) return [];
    const positions: { fen: string; lastMoveArrow?: Arrow }[] = [];
    const chess = new Chess();
    positions.push({ fen: chess.fen() });

    for (const san of activeTrap.movesSan) {
      try {
        const moveRes = chess.move(san);
        if (moveRes) {
          positions.push({
            fen: chess.fen(),
            lastMoveArrow: {
              startSquare: moveRes.from,
              endSquare: moveRes.to,
              color: '#E53935',
            },
          });
        }
      } catch (err) {
        console.warn('Error applying trap move:', err);
      }
    }
    return positions;
  }, [activeTrap]);

  // Handle step change and completion tracking
  const goToStep = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(opening.moves.length, idx));
      setCurrentStepIndex(clamped);

      // Check if user reached the end of the lesson
      if (clamped === opening.moves.length && !isLessonCompleted) {
        setIsLessonCompleted(true);
        updateOpeningProgress(opening.id, { completedLesson: true });
      }
    },
    [opening, isLessonCompleted]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTrap) {
        if (e.key === 'ArrowLeft') {
          setTrapStepIndex((prev) => Math.max(0, prev - 1));
        } else if (e.key === 'ArrowRight') {
          setTrapStepIndex((prev) => Math.min(activeTrap.movesSan.length, prev + 1));
        }
      } else {
        if (e.key === 'ArrowLeft') {
          goToStep(currentStepIndex - 1);
        } else if (e.key === 'ArrowRight') {
          goToStep(currentStepIndex + 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStepIndex, activeTrap, goToStep]);

  // Active position & arrow
  const currentDisplay = useMemo(() => {
    if (activeTrap) {
      const pos = trapPositions[trapStepIndex] || trapPositions[0];
      return {
        fen: pos?.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        arrow: pos?.lastMoveArrow,
      };
    }
    const pos = mainLinePositions[currentStepIndex] || mainLinePositions[0];
    return {
      fen: pos?.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      arrow: pos?.lastMoveArrow,
    };
  }, [activeTrap, trapPositions, trapStepIndex, mainLinePositions, currentStepIndex]);

  const currentMoveDetail =
    !activeTrap && currentStepIndex > 0 ? opening.moves[currentStepIndex - 1] : null;

  return (
    <div className="space-y-5">
      {/* 2-line Main Idea Banner */}
      <Card variant="surface-2" className="p-4 sm:p-5 space-y-2 border-[#1E2420]/15">
        <div className="flex items-center gap-2 text-xs font-bold text-[#1F6F50]">
          <Sparkles className="w-4 h-4" />
          <span>{bn.openings.mainIdeaTitle}</span>
        </div>
        <p className="text-sm font-medium text-[#1E2420] leading-snug">
          {opening.mainIdeaLines[0]}
        </p>
        <p className="text-xs sm:text-sm text-[#6B726D] leading-snug">
          {opening.mainIdeaLines[1]}
        </p>
      </Card>

      {/* Main Board and Explanation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left: Chessboard */}
        <div className="md:col-span-7 flex flex-col items-center gap-3">
          <div className="w-full max-w-[420px] aspect-square rounded-xl overflow-hidden shadow-card border border-[#1E2420]/15 select-none bg-[#EEEED2]">
            <Chessboard
              options={{
                position: currentDisplay.fen,
                boardOrientation: opening.forColor,
                arrows: currentDisplay.arrow ? [currentDisplay.arrow] : [],
                darkSquareStyle: { backgroundColor: '#769656' },
                lightSquareStyle: { backgroundColor: '#EEEED2' },
                showNotation: true,
                allowDragging: false,
              }}
            />
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center justify-center gap-2 w-full max-w-[420px]">
            {activeTrap ? (
              <>
                <Button
                  onClick={() => setTrapStepIndex(0)}
                  disabled={trapStepIndex === 0}
                  variant="secondary"
                  size="sm"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => setTrapStepIndex((p) => Math.max(0, p - 1))}
                  disabled={trapStepIndex === 0}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  {bn.review.prevMove}
                </Button>
                <span className="text-xs font-mono text-[#6B726D] px-2 select-none">
                  {toBanglaNumeral(trapStepIndex)} / {toBanglaNumeral(activeTrap.movesSan.length)}
                </span>
                <Button
                  onClick={() =>
                    setTrapStepIndex((p) => Math.min(activeTrap.movesSan.length, p + 1))
                  }
                  disabled={trapStepIndex >= activeTrap.movesSan.length}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  {bn.review.nextMove}
                </Button>
                <Button
                  onClick={() => setTrapStepIndex(activeTrap.movesSan.length)}
                  disabled={trapStepIndex >= activeTrap.movesSan.length}
                  variant="secondary"
                  size="sm"
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => goToStep(0)}
                  disabled={currentStepIndex === 0}
                  variant="secondary"
                  size="sm"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => goToStep(currentStepIndex - 1)}
                  disabled={currentStepIndex === 0}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  {bn.review.prevMove}
                </Button>
                <span className="text-xs font-mono text-[#6B726D] px-2 select-none">
                  {toBanglaNumeral(currentStepIndex)} / {toBanglaNumeral(opening.moves.length)}
                </span>
                <Button
                  onClick={() => goToStep(currentStepIndex + 1)}
                  disabled={currentStepIndex >= opening.moves.length}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  {bn.review.nextMove}
                </Button>
                <Button
                  onClick={() => goToStep(opening.moves.length)}
                  disabled={currentStepIndex >= opening.moves.length}
                  variant="secondary"
                  size="sm"
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Right: Move explanation or Trap details */}
        <div className="md:col-span-5 space-y-4">
          {activeTrap ? (
            <Card variant="surface" className="p-4 sm:p-5 space-y-3 border-[#E53935]/25 bg-[#FFEBEE]/20">
              <div className="flex items-center justify-between pb-2 border-b border-[#E53935]/20">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#C62828]">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{activeTrap.nameBn}</span>
                </div>
                <button
                  onClick={() => setActiveTrap(null)}
                  className="text-xs font-medium text-[#1F6F50] hover:underline cursor-pointer touch-target flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>মূল লাইনে ফিরে যান</span>
                </button>
              </div>

              <p className="text-xs sm:text-sm text-[#1E2420] leading-relaxed">
                {activeTrap.descriptionBn}
              </p>

              <div className="bg-[#FFFDF8] p-3 rounded-lg border border-[#1E2420]/10">
                <span className="text-xs text-[#6B726D] block mb-1">ফাঁদের সম্পূর্ণ চাল:</span>
                <p className="text-xs font-mono font-medium text-[#1E2420] leading-relaxed">
                  {activeTrap.movesSan.join(' ')}
                </p>
              </div>
            </Card>
          ) : (
            <Card variant="surface" className="p-4 sm:p-5 space-y-4 border-[#1E2420]/15">
              <div className="flex items-center justify-between pb-2 border-b border-[#1E2420]/10">
                <span className="text-xs font-mono font-semibold text-[#1F6F50]">
                  {currentStepIndex === 0 ? 'সূচনা অবস্থান' : `চাল ${toBanglaNumeral(currentStepIndex)}`}
                </span>
                {currentMoveDetail && (
                  <span className="text-base font-bold font-mono text-[#1E2420] bg-[#E6F2EC] px-2.5 py-0.5 rounded-lg border border-[#1F6F50]/20">
                    {currentMoveDetail.san}
                  </span>
                )}
              </div>

              {currentMoveDetail ? (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-[#1F6F50]">
                    {bn.openings.whyThisMove}
                  </h4>
                  <p className="text-sm text-[#1E2420] leading-relaxed">
                    {currentMoveDetail.explanationBn}
                  </p>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-[#6B726D] leading-relaxed">
                  বোর্ডের নিচে "পরবর্তী চাল" বাটনে চাপ দিয়ে ওপেনিংয়ের প্রতিটি চাল ও তার পেছনের উদ্দেশ্য দেখে নিন।
                </p>
              )}

              {/* Lesson Completion Notice */}
              {isLessonCompleted && (
                <div className="pt-2 border-t border-[#1E2420]/10 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#2E7D32]">
                    <Trophy className="w-4 h-4 text-[#E0A43A]" />
                    <span>{bn.openings.progressCompleted}</span>
                  </div>
                  <Button
                    onClick={onSwitchToPractice}
                    variant="primary"
                    size="sm"
                    className="w-full"
                    leftIcon={<Play className="w-4 h-4 fill-current" />}
                  >
                    {bn.openings.btnStartPractice}
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* Traps Selector Strip */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#6B726D] uppercase tracking-wider">
              {bn.openings.trapsTitle}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {opening.traps.map((trap) => {
                const isActive = activeTrap?.id === trap.id;
                return (
                  <button
                    key={trap.id}
                    onClick={() => {
                      if (isActive) {
                        setActiveTrap(null);
                      } else {
                        setActiveTrap(trap);
                        setTrapStepIndex(0);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer touch-target ${
                      isActive
                        ? 'border-[#E53935] bg-[#FFEBEE] shadow-xs'
                        : 'border-[#1E2420]/15 bg-[#FFFDF8] hover:bg-[#F4EFE4]'
                    }`}
                  >
                    <span className="text-xs font-bold text-[#C62828] block truncate">
                      ⚠️ {trap.nameBn}
                    </span>
                    <span className="text-[11px] text-[#6B726D] mt-0.5 block truncate">
                      {trap.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
