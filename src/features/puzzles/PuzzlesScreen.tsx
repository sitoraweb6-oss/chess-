import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';

import {
  Puzzle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Play,
  RotateCcw,
  Calendar,
  Layers,
  Bot,
  ChevronRight,
} from 'lucide-react';
import { Card } from '../../components/ui/Card.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { bn, toBanglaNumeral } from '../../i18n/bn.ts';
import {
  getStorageData,
  addPersonalPuzzles,
  getDuePersonalPuzzles,
} from '../../storage/index.ts';
import { PersonalPuzzle } from '../../domain/puzzles.ts';
import { ANIMATION_SPEEDS, getBoardTheme } from '../../utils/theme.ts';
import { useSettings } from '../../hooks/useSettings.ts';
import { usePuzzleSession } from './usePuzzleSession.ts';

export const PuzzlesScreen: React.FC = () => {
  const navigate = useNavigate();
  const storageData = getStorageData();
  const { settings } = useSettings();

  const [filter, setFilter] = useState<'due' | 'all'>('due');
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState<number>(0);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);

  // Puzzles list
  const duePuzzles = useMemo(() => getDuePersonalPuzzles(), [storageData.puzzles]);
  const allPuzzles = storageData.puzzles;
  const activeList =
    filter === 'due' ? (duePuzzles.length > 0 ? duePuzzles : allPuzzles) : allPuzzles;
  const currentPuzzle: PersonalPuzzle | undefined = activeList[currentPuzzleIndex];

  // Active live puzzle session hook
  const {
    chess,
    fen,
    sessionState,
    userStepCount,
    attemptsOnCurrentMove,
    statusMessage,
    statusType,
    hintSquare,
    answerArrow,
    lastUserMove,
    lastOpponentMove,
    errorText,
    userColor,
    turnColor,
    handleUserMove,
  } = usePuzzleSession(currentPuzzle, settings.sound);

  const boardThemeColors = getBoardTheme(settings.boardTheme);

  // Seed sample blunder puzzle for demonstration if storage is empty
  const handleSeedSamplePuzzle = () => {
    const sample: PersonalPuzzle = {
      id: `sample-${Date.now()}`,
      gameId: 'sample-game',
      date: new Date().toISOString(),
      fenBefore: 'r1bqk2r/pppp1ppp/2n5/4p3/1bB1n3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 6',
      userMoveSan: 'Nxe4',
      bestMoveSan: 'Bxf7+',
      bestMoveUci: 'c4f7',
      bestMovePieceSquare: 'c4',
      bestMoveTargetSquare: 'f7',
      explanationBn:
        'Bxf7+ চালের পর কালোর রাজা নড়ে যায় এবং ক্যাসলিংয়ের অধিকার নষ্ট হয়ে সাদা আক্রমণে এগিয়ে যায়।',
      winGain: 28,
      category: 'blunder',
      box: 0,
      dueDate: new Date().toISOString(),
      solvedCount: 0,
      failedCount: 0,
    };
    addPersonalPuzzles([sample]);
    window.location.reload();
  };

  // Next puzzle
  const handleNextPuzzle = () => {
    setSelectedSquare(null);
    setLegalMoves([]);
    if (currentPuzzleIndex < activeList.length - 1) {
      setCurrentPuzzleIndex((prev) => prev + 1);
    } else {
      setCurrentPuzzleIndex(0);
    }
  };

  // Continue play against bot from current position
  const handleContinuePlay = () => {
    navigate(`/play?fen=${encodeURIComponent(fen)}&unrated=true`);
  };

  // Drag and drop handler
  const handlePieceDrop = ({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string;
    targetSquare: string | null;
  }): boolean => {
    if (!targetSquare || sessionState !== 'userTurn') return false;
    const ok = handleUserMove(sourceSquare as Square, targetSquare as Square);
    if (ok) {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
    return ok;
  };

  // Tap-to-move handler
  const handleSquareClick = ({ square }: { square: string }) => {
    if (sessionState !== 'userTurn') return;
    const sq = square as Square;

    if (selectedSquare) {
      if (selectedSquare === sq) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      const moves = chess.moves({ square: selectedSquare, verbose: true });
      const targetMove = moves.find((m: { to: string }) => m.to === sq);

      if (targetMove) {
        const ok = handleUserMove(selectedSquare, sq);
        if (ok) {
          setSelectedSquare(null);
          setLegalMoves([]);
        }
      } else {
        const piece = chess.get(sq);
        if (piece && piece.color === chess.turn()) {
          setSelectedSquare(sq);
          const newMoves = chess.moves({ square: sq, verbose: true }).map((m: { to: string }) => m.to as Square);
          setLegalMoves(newMoves);
        } else {
          setSelectedSquare(null);
          setLegalMoves([]);
        }
      }
    } else {
      const piece = chess.get(sq);
      if (piece && piece.color === chess.turn()) {
        setSelectedSquare(sq);
        const newMoves = chess.moves({ square: sq, verbose: true }).map((m: { to: string }) => m.to as Square);
        setLegalMoves(newMoves);
      }
    }
  };

  // Highlight square styles
  const squareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    // Selected square
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: 'rgba(224, 164, 58, 0.4)',
        boxShadow: '0 0 8px #E0A43A',
      };
    }

    // Legal move dots
    if (settings.showLegalMoves && legalMoves.length > 0) {
      legalMoves.forEach((sq) => {
        const piece = chess.get(sq);
        styles[sq] = {
          background: piece
            ? 'radial-gradient(circle, rgba(229,57,53,0.5) 20%, transparent 80%)'
            : 'radial-gradient(circle, rgba(31,111,80,0.5) 25%, transparent 25%)',
          borderRadius: '50%',
        };
      });
    }

    // Gentle hint highlight on 1st miss
    if (hintSquare) {
      styles[hintSquare] = {
        backgroundColor: 'rgba(224, 164, 58, 0.5)',
        boxShadow: '0 0 12px #E0A43A',
      };
    }

    // Last user move
    if (lastUserMove) {
      styles[lastUserMove.from] = { backgroundColor: 'rgba(31, 111, 80, 0.25)' };
      styles[lastUserMove.to] = { backgroundColor: 'rgba(31, 111, 80, 0.35)' };
    }

    // Last opponent move
    if (lastOpponentMove) {
      styles[lastOpponentMove.from] = { backgroundColor: 'rgba(224, 164, 58, 0.25)' };
      styles[lastOpponentMove.to] = { backgroundColor: 'rgba(224, 164, 58, 0.35)' };
    }

    return styles;
  }, [
    selectedSquare,
    legalMoves,
    settings.showLegalMoves,
    hintSquare,
    lastUserMove,
    lastOpponentMove,
    chess,
  ]);

  if (activeList.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-accent-soft text-accent rounded-2xl flex items-center justify-center text-3xl shadow-xs">
          <Puzzle className="w-8 h-8 text-accent" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-app">{bn.puzzles.title}</h2>
          <p className="text-sm text-muted max-w-md mx-auto">
            {bn.puzzles.emptyDesc}
          </p>
        </div>
        <Button
          onClick={handleSeedSamplePuzzle}
          variant="primary"
          leftIcon={<Sparkles className="w-4 h-4" />}
        >
          {bn.puzzles.seedSampleBtn}
        </Button>
      </div>
    );
  }

  if (!currentPuzzle) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-app">
        <div>
          <h1 className="text-2xl font-bold text-app flex items-center gap-2">
            <Puzzle className="w-6 h-6 text-primary-themed" />
            <span>{bn.puzzles.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            {bn.puzzles.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-surface-2 rounded-xl border border-app self-start sm:self-auto">
          <button
            onClick={() => {
              setFilter('due');
              setCurrentPuzzleIndex(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer touch-target ${
              filter === 'due'
                ? 'bg-surface text-primary-themed shadow-xs'
                : 'text-muted hover:text-app'
            }`}
          >
            সমাধানযোগ্য ({toBanglaNumeral(duePuzzles.length)})
          </button>
          <button
            onClick={() => {
              setFilter('all');
              setCurrentPuzzleIndex(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer touch-target ${
              filter === 'all'
                ? 'bg-surface text-primary-themed shadow-xs'
                : 'text-muted hover:text-app'
            }`}
          >
            সব পাজল ({toBanglaNumeral(allPuzzles.length)})
          </button>
        </div>
      </div>

      {/* Main Puzzle Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Board & Live State Header */}
        <div className="lg:col-span-7 space-y-3 flex flex-col items-center">
          {/* Top Status & Step Bar */}
          <div className="w-full max-w-[420px] flex items-center justify-between px-3 py-2 rounded-xl bg-surface-2 border border-app text-xs font-medium">
            <div className="flex items-center gap-2">
              <Badge variant={currentPuzzle.category === 'blunder' ? 'blunder' : 'mistake'} size="sm">
                {currentPuzzle.category === 'blunder' ? 'ব্লান্ডার' : 'ভুল'}
              </Badge>
              <span className="text-muted text-[11px]">
                +{toBanglaNumeral(currentPuzzle.winGain)}% সুযোগ
              </span>
            </div>

            {/* Step Counter */}
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">
                ধাপ {toBanglaNumeral(Math.min(userStepCount + 1, 3))}/৩
              </Badge>
              <span className="text-[11px] font-mono text-muted">
                {userColor === 'white' ? 'সাদা ঘুঁটি' : 'কালো ঘুঁটি'}
              </span>
            </div>
          </div>

          {/* Chessboard Container */}
          <div
            className="w-full max-w-[420px] aspect-square rounded-xl overflow-hidden shadow-card border border-app select-none transition-colors"
            style={{ backgroundColor: boardThemeColors.light }}
          >
            <Chessboard
              key={`puzzle-board-${currentPuzzle.id}-${settings.boardTheme}-${settings.showCoordinates}`}
              options={{
                position: fen,
                boardOrientation: userColor,
                onPieceDrop: handlePieceDrop,
                onSquareClick: handleSquareClick,
                squareStyles,
                arrows: answerArrow ? [answerArrow] : [],
                darkSquareStyle: { backgroundColor: boardThemeColors.dark },
                lightSquareStyle: { backgroundColor: boardThemeColors.light },
                darkSquareNotationStyle: { color: boardThemeColors.light },
                lightSquareNotationStyle: { color: boardThemeColors.dark },
                showNotation: settings.showCoordinates,
                allowDragging: sessionState === 'userTurn',
                animationDurationInMs: ANIMATION_SPEEDS[settings.animationSpeed] || 200,
              }}
            />
          </div>

          {/* Turn Indicator Strip */}
          <div className="w-full max-w-[420px] flex items-center justify-between px-3 py-2 rounded-xl bg-surface border border-app text-xs">
            <div className="flex items-center gap-2">
              {sessionState === 'opponentTurn' ? (
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold animate-pulse">
                  <Bot className="w-4 h-4" />
                  <span>প্রতিপক্ষ ভাবছে...</span>
                </span>
              ) : sessionState === 'checking' ? (
                <span className="flex items-center gap-1.5 text-primary-themed font-semibold animate-pulse">
                  <Sparkles className="w-4 h-4" />
                  <span>চাল মূল্যায়ন করা হচ্ছে...</span>
                </span>
              ) : sessionState === 'solved' ? (
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>সমাধান হয়েছে! ✨</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-app font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping shrink-0" />
                  <span>তোমার চাল</span>
                </span>
              )}
            </div>

            <span className="text-[11px] text-muted">
              পাজল {toBanglaNumeral(currentPuzzleIndex + 1)} / {toBanglaNumeral(activeList.length)}
            </span>
          </div>
        </div>

        {/* Right Column: Feedback, Hints, Explanations & Next Steps */}
        <div className="lg:col-span-5 space-y-4">
          {/* Spaced Repetition Box Card */}
          <Card variant="surface-2" className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <Badge variant="accent" size="sm">
                বাক্স {toBanglaNumeral(currentPuzzle.box + 1)}
              </Badge>
              <span className="text-muted text-[11px]">
                মূল খেলা থেকে প্রাপ্ত পাজল
              </span>
            </div>
            <div className="text-xs text-muted space-y-1">
              <div className="flex items-center justify-between">
                <span>মূল ভুলের চাল:</span>
                <span className="font-mono font-semibold text-app">{currentPuzzle.userMoveSan}</span>
              </div>
            </div>
          </Card>

          {/* Status / Feedback / Solved Panel */}
          {sessionState === 'solved' ? (
            <Card variant="highlight" className="p-5 space-y-4 border-emerald-500/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-app">
                    চমৎকার! পাজলটি সফলভাবে সমাধান করেছো! ✨
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    সঠিক চালে তোমার পজিশন আবার মজবুত হয়েছে।
                  </p>
                </div>
              </div>

              {/* Bangla Teacher Explanation */}
              <div className="p-3.5 rounded-xl bg-surface border border-app space-y-1.5 text-xs text-app">
                <div className="font-semibold text-primary-themed flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-accent" />
                  <span>শিক্ষকের টিপস:</span>
                </div>
                <p className="leading-relaxed text-muted">
                  {currentPuzzle.explanationBn}
                </p>
              </div>

              {/* Two Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <Button
                  onClick={handleNextPuzzle}
                  variant="primary"
                  size="md"
                  className="w-full justify-center"
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  পরের পাজল
                </Button>

                <Button
                  onClick={handleContinuePlay}
                  variant="secondary"
                  size="md"
                  className="w-full justify-center"
                  leftIcon={<Play className="w-4 h-4 fill-current" />}
                >
                  এখান থেকে খেলা চালিয়ে যাও
                </Button>
              </div>
            </Card>
          ) : (
            <Card variant="surface" className="p-5 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-app">
                  {statusType === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  ) : statusType === 'error' ? (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-primary-themed" />
                  )}
                  <span>{statusMessage || 'তোমার চাল দাও'}</span>
                </div>

                {errorText && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
                    {errorText}
                  </div>
                )}
              </div>

              {/* Instructions text */}
              <div className="p-3 rounded-xl bg-surface-2 border border-app text-xs text-muted space-y-1">
                <p className="font-medium text-app">কী করতে হবে?</p>
                <p>
                  বোর্ডে তোমার দলের ঘুঁটি সরিয়ে সবচেয়ে শক্তিশালী চাল নির্বাচন করো। ভুল হলে শিক্ষক তোমাকে ইঙ্গিত দেবেন।
                </p>
              </div>

              {/* Next puzzle button if user wants to skip */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleNextPuzzle}
                  className="text-xs text-muted hover:text-primary-themed flex items-center gap-1 cursor-pointer touch-target"
                >
                  <span>স্কিপ করো</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
