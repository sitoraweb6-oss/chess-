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
  Lightbulb,
  ShieldAlert,
  GitBranch,
} from 'lucide-react';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { ChessOpening, OpeningTrap, OpeningVariation } from '../../domain/openings.ts';
import { updateOpeningProgress, getOpeningProgress, getStorageData } from '../../storage/index.ts';
import { bn, toBanglaNumeral } from '../../i18n/bn.ts';
import { BOARD_THEMES, ANIMATION_SPEEDS, getBoardTheme } from '../../utils/theme.ts';
import { useSettings } from '../../hooks/useSettings.ts';

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
  const [activeVariation, setActiveVariation] = useState<OpeningVariation | null>(null);
  const [variationStepIndex, setVariationStepIndex] = useState<number>(0);

  const [isLessonCompleted, setIsLessonCompleted] = useState<boolean>(() => {
    return getOpeningProgress(opening.id).completedLesson;
  });

  const { settings } = useSettings();
  const boardThemeColors = getBoardTheme(settings.boardTheme);

  // Reset indices when opening changes
  useEffect(() => {
    setCurrentStepIndex(0);
    setActiveTrap(null);
    setTrapStepIndex(0);
    setActiveVariation(null);
    setVariationStepIndex(0);
    setIsLessonCompleted(getOpeningProgress(opening.id).completedLesson);
  }, [opening.id]);

  // Compute positions for main line
  const mainLinePositions = useMemo(() => {
    const positions: { fen: string; lastMoveArrow?: Arrow }[] = [];
    const chess = new Chess();
    positions.push({ fen: chess.fen() });

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

  // Compute positions for active variation
  const variationPositions = useMemo(() => {
    if (!activeVariation) return [];
    const positions: { fen: string; lastMoveArrow?: Arrow }[] = [];
    const chess = new Chess();
    positions.push({ fen: chess.fen() });

    for (const san of activeVariation.movesSan) {
      try {
        const moveRes = chess.move(san);
        if (moveRes) {
          positions.push({
            fen: chess.fen(),
            lastMoveArrow: {
              startSquare: moveRes.from,
              endSquare: moveRes.to,
              color: '#1E88E5',
            },
          });
        }
      } catch (err) {
        console.warn('Error applying variation move:', err);
      }
    }
    return positions;
  }, [activeVariation]);

  // Handle step change and completion tracking
  const goToStep = useCallback(
    (step: number) => {
      const maxStep = opening.moves.length;
      const clamped = Math.max(0, Math.min(maxStep, step));
      setCurrentStepIndex(clamped);

      // Mark lesson as complete when user reaches the end
      if (clamped === maxStep && !isLessonCompleted) {
        setIsLessonCompleted(true);
        updateOpeningProgress(opening.id, { completedLesson: true });
      }
    },
    [opening.id, opening.moves.length, isLessonCompleted]
  );

  // Active board state (Trap vs Variation vs Main line)
  const currentBoardState = useMemo(() => {
    if (activeTrap) {
      const pos = trapPositions[trapStepIndex] || trapPositions[0];
      return {
        fen: pos?.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        arrows: pos?.lastMoveArrow ? [pos.lastMoveArrow] : [],
      };
    }
    if (activeVariation) {
      const pos = variationPositions[variationStepIndex] || variationPositions[0];
      return {
        fen: pos?.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        arrows: pos?.lastMoveArrow ? [pos.lastMoveArrow] : [],
      };
    }
    const pos = mainLinePositions[currentStepIndex] || mainLinePositions[0];
    return {
      fen: pos?.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      arrows: pos?.lastMoveArrow ? [pos.lastMoveArrow] : [],
    };
  }, [
    activeTrap,
    trapPositions,
    trapStepIndex,
    activeVariation,
    variationPositions,
    variationStepIndex,
    mainLinePositions,
    currentStepIndex,
  ]);

  const currentMoveDetail =
    currentStepIndex > 0 ? opening.moves[currentStepIndex - 1] : null;

  return (
    <div className="space-y-6">
      {/* Lesson Complete Alert Card */}
      {isLessonCompleted && !activeTrap && !activeVariation && (
        <Card variant="highlight" className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-primary">
                {bn.openings.lessonCompleteTitle}
              </h4>
              <p className="text-xs text-muted">
                {bn.openings.lessonCompleteDesc}
              </p>
            </div>
          </div>
          <Button
            onClick={onSwitchToPractice}
            variant="primary"
            size="sm"
            rightIcon={<Play className="w-4 h-4 fill-current" />}
            className="shrink-0 w-full sm:w-auto"
          >
            {bn.openings.btnStartPractice}
          </Button>
        </Card>
      )}

      {/* Main Interactive Board and Move Stepper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Board */}
        <div className="lg:col-span-7 flex flex-col items-center space-y-3">
          {/* Active Mode Notice */}
          {activeTrap && (
            <div className="w-full max-w-[420px] flex items-center justify-between px-3 py-1.5 rounded-lg bg-danger-soft text-xs text-danger border border-danger/30">
              <span className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>ফাঁদ: {activeTrap.nameBn}</span>
              </span>
              <button
                onClick={() => setActiveTrap(null)}
                className="underline hover:opacity-80 cursor-pointer"
              >
                মূল লাইনে ফিরুন
              </button>
            </div>
          )}

          {activeVariation && (
            <div className="w-full max-w-[420px] flex items-center justify-between px-3 py-1.5 rounded-lg bg-primary-soft text-xs text-primary border border-primary/30">
              <span className="font-bold flex items-center gap-1.5">
                <GitBranch className="w-4 h-4" />
                <span>ভ্যারিয়েশন: {activeVariation.nameBn}</span>
              </span>
              <button
                onClick={() => setActiveVariation(null)}
                className="underline hover:opacity-80 cursor-pointer"
              >
                মূল লাইনে ফিরুন
              </button>
            </div>
          )}

          {/* Chessboard */}
          <div
            className="w-full max-w-[420px] aspect-square rounded-xl overflow-hidden shadow-card border border-app select-none transition-colors"
            style={{ backgroundColor: boardThemeColors.light }}
          >
            <Chessboard
              key={`lesson-board-${settings.boardTheme}-${settings.showCoordinates}-${settings.animationSpeed}`}
              options={{
                position: currentBoardState.fen,
                boardOrientation: opening.forColor,
                arrows: currentBoardState.arrows,
                darkSquareStyle: { backgroundColor: boardThemeColors.dark },
                lightSquareStyle: { backgroundColor: boardThemeColors.light },
                darkSquareNotationStyle: { color: boardThemeColors.light },
                lightSquareNotationStyle: { color: boardThemeColors.dark },
                showNotation: settings.showCoordinates,
                allowDragging: false,
                animationDurationInMs: ANIMATION_SPEEDS[settings.animationSpeed] || 200,
              }}
            />
          </div>

          {/* Stepper Controls */}
          {!activeTrap && !activeVariation && (
            <div className="flex items-center justify-center gap-2 w-full max-w-[420px]">
              <Button
                onClick={() => goToStep(0)}
                disabled={currentStepIndex === 0}
                variant="secondary"
                size="sm"
                aria-label="শুরুতে"
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
                পূর্ববর্তী
              </Button>
              <span className="text-xs font-mono text-muted px-2 select-none">
                চাল {toBanglaNumeral(currentStepIndex)} / {toBanglaNumeral(opening.moves.length)}
              </span>
              <Button
                onClick={() => goToStep(currentStepIndex + 1)}
                disabled={currentStepIndex === opening.moves.length}
                variant="secondary"
                size="sm"
                className="flex-1"
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                পরবর্তী
              </Button>
              <Button
                onClick={() => goToStep(opening.moves.length)}
                disabled={currentStepIndex === opening.moves.length}
                variant="secondary"
                size="sm"
                aria-label="শেষে"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Trap stepper controls */}
          {activeTrap && (
            <div className="flex items-center justify-center gap-2 w-full max-w-[420px]">
              <Button
                onClick={() => setTrapStepIndex((prev) => Math.max(0, prev - 1))}
                disabled={trapStepIndex === 0}
                variant="secondary"
                size="sm"
                className="flex-1"
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                পূর্ববর্তী
              </Button>
              <span className="text-xs font-mono text-muted px-2 select-none">
                {toBanglaNumeral(trapStepIndex)} / {toBanglaNumeral(activeTrap.movesSan.length)}
              </span>
              <Button
                onClick={() => setTrapStepIndex((prev) => Math.min(activeTrap.movesSan.length, prev + 1))}
                disabled={trapStepIndex === activeTrap.movesSan.length}
                variant="secondary"
                size="sm"
                className="flex-1"
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                পরবর্তী
              </Button>
            </div>
          )}

          {/* Variation stepper controls */}
          {activeVariation && (
            <div className="flex items-center justify-center gap-2 w-full max-w-[420px]">
              <Button
                onClick={() => setVariationStepIndex((prev) => Math.max(0, prev - 1))}
                disabled={variationStepIndex === 0}
                variant="secondary"
                size="sm"
                className="flex-1"
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                পূর্ববর্তী
              </Button>
              <span className="text-xs font-mono text-muted px-2 select-none">
                {toBanglaNumeral(variationStepIndex)} / {toBanglaNumeral(activeVariation.movesSan.length)}
              </span>
              <Button
                onClick={() => setVariationStepIndex((prev) => Math.min(activeVariation.movesSan.length, prev + 1))}
                disabled={variationStepIndex === activeVariation.movesSan.length}
                variant="secondary"
                size="sm"
                className="flex-1"
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                পরবর্তী
              </Button>
            </div>
          )}
        </div>

        {/* Right: "কেন এই চাল?" & Explanation Panel */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Idea Card */}
          <Card variant="surface" className="p-4 space-y-2 border-l-4 border-l-primary">
            <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>{bn.openings.mainIdeaTitle}</span>
            </span>
            <ul className="space-y-1.5 text-xs text-fg leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-primary font-bold">•</span>
                <span>{opening.mainIdeaLines[0]}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-primary font-bold">•</span>
                <span>{opening.mainIdeaLines[1]}</span>
              </li>
            </ul>
          </Card>

          {/* Current Move "কেন এই চাল?" */}
          {!activeTrap && !activeVariation && (
            <Card variant="surface-2" className="p-4 space-y-2 border border-border">
              <div className="flex items-center justify-between pb-1.5 border-b border-border">
                <span className="text-xs font-bold text-fg">
                  {bn.openings.whyThisMove}
                </span>
                {currentMoveDetail && (
                  <span className="font-mono font-bold text-sm px-2 py-0.5 rounded-md bg-primary text-primary-fg">
                    {currentMoveDetail.san}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-fg leading-relaxed">
                {currentMoveDetail
                  ? currentMoveDetail.explanationBn
                  : 'বোর্ডের শুরুতে উভয় পক্ষের প্রাথমিক সৈন্য ও ঘুঁটিগুলো তাদের মূল অবস্থানে রয়েছে। পরবর্তী বোতামে চাপ দিয়ে চালগুলো দেখুন।'}
              </p>
            </Card>
          )}

          {/* Gambit Details: Sacrifice, Compensation & Refutation */}
          {opening.gambitDetails && (
            <Card variant="surface" className="p-4 space-y-3 border-l-4 border-l-accent">
              <span className="text-xs font-bold text-accent flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>গ্যাম্বিট বিশ্লেষণ ও কৌশল</span>
              </span>

              <div className="space-y-2 text-xs leading-relaxed">
                <div>
                  <span className="font-semibold text-fg block text-[11px] text-accent">
                    {bn.openings.gambitSacrificeTitle}
                  </span>
                  <p className="text-muted">
                    {opening.gambitDetails.sacrificeBn}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-fg block text-[11px] text-primary">
                    {bn.openings.gambitCompensationTitle}
                  </span>
                  <p className="text-muted">
                    {opening.gambitDetails.compensationBn}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-fg block text-[11px] text-danger">
                    {bn.openings.gambitRefutationTitle}
                  </span>
                  <p className="text-muted">
                    {opening.gambitDetails.refutationBn}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Middlegame 3 Plans */}
          <Card variant="surface" className="p-4 space-y-2">
            <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4" />
              <span>{bn.openings.middlegamePlansTitle}</span>
            </span>
            <ul className="space-y-1.5 text-xs text-muted list-disc list-inside">
              <li>{opening.middlegamePlans[0]}</li>
              <li>{opening.middlegamePlans[1]}</li>
              <li>{opening.middlegamePlans[2]}</li>
            </ul>
          </Card>

          {/* Typical Beginner Mistakes */}
          <Card variant="surface" className="p-4 space-y-2 border-l-4 border-l-accent">
            <span className="text-xs font-semibold text-accent flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>{bn.openings.typicalMistakesTitle}</span>
            </span>
            <ul className="space-y-1 text-xs text-muted list-disc list-inside">
              <li>{opening.typicalMistakes[0]}</li>
              <li>{opening.typicalMistakes[1]}</li>
            </ul>
          </Card>

          {/* Variations Section */}
          {opening.variations && opening.variations.length > 0 && (
            <Card variant="surface" className="p-4 space-y-2.5">
              <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                <GitBranch className="w-4 h-4" />
                <span>{bn.openings.variationsTab}</span>
              </span>
              <div className="space-y-2">
                {opening.variations.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => {
                      setActiveVariation(v);
                      setActiveTrap(null);
                      setVariationStepIndex(0);
                    }}
                    className="p-2.5 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer bg-surface"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-fg">
                        {v.nameBn}
                      </span>
                      <span className="text-[10px] text-primary font-semibold">লাইন দেখুন</span>
                    </div>
                    <p className="text-[11px] text-muted mt-0.5">{v.descriptionBn}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Traps Section */}
          <Card variant="surface" className="p-4 space-y-2.5 border-l-4 border-l-danger">
            <span className="text-xs font-semibold text-danger flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>{bn.openings.trapsTitle}</span>
            </span>
            <p className="text-xs text-muted">{bn.openings.trapsDesc}</p>
            <div className="space-y-2">
              {opening.traps.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setActiveTrap(t);
                    setActiveVariation(null);
                    setTrapStepIndex(0);
                  }}
                  className="p-2.5 rounded-lg border border-danger/30 hover:border-danger transition-colors cursor-pointer bg-danger-soft/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-danger">
                      {t.nameBn}
                    </span>
                    <span className="text-[10px] text-danger font-semibold">{bn.openings.viewTrapLine}</span>
                  </div>
                  <p className="text-[11px] text-muted mt-0.5">{t.descriptionBn}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
