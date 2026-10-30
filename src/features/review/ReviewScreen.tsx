import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Chess, Square } from 'chess.js';
import { Chessboard, Arrow } from 'react-chessboard';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';
import { EvalBar } from './EvalBar.tsx';
import { ReviewSummary } from './ReviewSummary.tsx';
import { ExplanationCard } from './ExplanationCard.tsx';
import { ProgressBar } from '../../components/ui/ProgressBar.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { ErrorState } from '../../components/ui/ErrorState.tsx';
import { bn, toBanglaNumeral } from '../../i18n/bn.ts';
import {
  getStorageData,
  cacheGameAnalysis,
  GameRecord,
  ReviewedMove,
  GameAnalysis,
  MoveClassification,
} from '../../storage/index.ts';
import { stockfishEngine } from '../../engine/index.ts';
import { seedEvaluationCache, evaluateFenSafe } from '../../engine/evaluator.ts';
import { extractMistakePuzzles } from '../../domain/puzzles.ts';
import { addPersonalPuzzles } from '../../storage/index.ts';
import { LessonLearnedCard } from './LessonLearnedCard.tsx';
import { BOARD_THEMES, getBoardTheme } from '../../utils/theme.ts';
import { useSettings } from '../../hooks/useSettings.ts';
import {
  calculateWinPercent,
  calculateMoveAccuracy,
  calculateGameAccuracy,
  classifyMove,
} from '../../domain/accuracy.ts';
import { generateMoveExplanation, formatUciMoveToBangla } from '../../domain/explanations.ts';

export const ReviewScreen: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  const [game, setGame] = useState<GameRecord | null>(null);
  const [analysis, setAnalysis] = useState<GameAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyzingProgress, setAnalyzingProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0,
  });
  const [engineError, setEngineError] = useState<string | null>(null);
  const [technicalDetails, setTechnicalDetails] = useState<string | null>(null);
  const analysisStartedForGameIdRef = useRef<string | null>(null);

  // Review position cursor
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(0);
  const [displayFen, setDisplayFen] = useState<string>('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [isPlayingBestLine, setIsPlayingBestLine] = useState<boolean>(false);
  const bestLineTimeoutRef = useRef<number[]>([]);

  // Dev helper: Scholar's Mate (4-move checkmate) for fast verification
  const loadScholarMateTest = useCallback(() => {
    console.log('[ReviewScreen] Loading Scholar\'s Mate test game...');
    const testGame: GameRecord = {
      id: `test-scholars-mate-${Date.now()}`,
      date: new Date().toISOString(),
      userColor: 'white',
      botLevel: 1,
      result: 'win',
      resultReason: 'চেকমেট',
      fen: 'r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4',
      pgn: '1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7#',
      movesCount: 7,
      accuracy: 100,
    };
    analysisStartedForGameIdRef.current = null;
    setAnalysis(null);
    setGame(testGame);
  }, []);

  // Load game from storage
  useEffect(() => {
    const data = getStorageData();
    let targetGame: GameRecord | undefined;
    if (gameId) {
      targetGame = data.games.find((g) => g.id === gameId);
    } else if (data.games.length > 0) {
      targetGame = data.games[0];
    }

    if (targetGame) {
      setGame(targetGame);
      if (targetGame.analysis) {
        setAnalysis(targetGame.analysis);
        if (targetGame.analysis.moves.length > 0) {
          setDisplayFen(targetGame.analysis.moves[0].fenAfter);
        }
      }
    }
  }, [gameId]);

  // Run engine analysis if not cached
  useEffect(() => {
    if (!game || analysis) return;
    if (analysisStartedForGameIdRef.current === game.id) return;
    analysisStartedForGameIdRef.current = game.id;

    let isCancelled = false;

    const runAnalysis = async () => {
      setIsAnalyzing(true);
      setEngineError(null);
      setTechnicalDetails(null);

      try {
        await stockfishEngine.init();
        const chess = new Chess();
        if (game.pgn) {
          try {
            chess.loadPgn(game.pgn);
          } catch {
            // fallback
          }
        }

        const historyVerbose = chess.history({ verbose: true });
        const totalPlies = historyVerbose.length;

        if (totalPlies === 0) {
          setIsAnalyzing(false);
          return;
        }

        setAnalyzingProgress({ current: 0, total: totalPlies });

        // Replay positions to collect FENs
        const replayChess = new Chess();
        const positions: {
          ply: number;
          san: string;
          uci: string;
          fenBefore: string;
          fenAfter: string;
          isUser: boolean;
        }[] = [];

        for (let i = 0; i < historyVerbose.length; i++) {
          const move = historyVerbose[i];
          const fenBefore = replayChess.fen();
          const isUser =
            (replayChess.turn() === 'w' && game.userColor === 'white') ||
            (replayChess.turn() === 'b' && game.userColor === 'black');

          replayChess.move({ from: move.from, to: move.to, promotion: move.promotion });
          const fenAfter = replayChess.fen();

          positions.push({
            ply: i + 1,
            san: move.san,
            uci: `${move.from}${move.to}${move.promotion || ''}`,
            fenBefore,
            fenAfter,
            isUser,
          });
        }

        // Seed evaluation cache if game has background-evaluated positions
        if (game.evaluationsByFen) {
          seedEvaluationCache(game.evaluationsByFen);
        }

        // Reset engine state and hash tables before full game review
        try {
          await stockfishEngine.newGame();
        } catch (ngErr) {
          console.warn('[ReviewScreen] newGame error before review:', ngErr);
        }

        const evaluateFenWithRetry = async (
          f: string
        ): Promise<{ cp?: number; mate?: number; bestMove: string; pv: string } | null> => {
          try {
            return await evaluateFenSafe(f, { movetime: 300 });
          } catch (err) {
            console.error(`[ReviewScreen] Evaluation failed for FEN: ${f}`, err);
            return null;
          }
        };

        const reviewedMoves: ReviewedMove[] = [];
        const userMoveAccuracies: number[] = [];

        let brilliantCount = 0;
        let goodCount = 0;
        let inaccuracyCount = 0;
        let mistakeCount = 0;
        let blunderCount = 0;
        let failedPositionsCount = 0;

        for (let i = 0; i < positions.length; i++) {
          if (isCancelled) return;
          const pos = positions[i];
          setAnalyzingProgress({ current: i + 1, total: totalPlies });

          const evalBefore = await evaluateFenWithRetry(pos.fenBefore);
          const evalAfter = await evaluateFenWithRetry(pos.fenAfter);

          // FIX 4: If a position still fails after retry, do not crash; mark unanalyzed
          if (!evalBefore || !evalAfter) {
            failedPositionsCount++;
            reviewedMoves.push({
              ...pos,
              classification: undefined,
              evalBefore: evalBefore || { bestMove: '', pv: '' },
              evalAfter: evalAfter || { bestMove: '', pv: '' },
              winDrop: undefined,
              accuracy: undefined,
              explanation: undefined,
              bestMoveSan: evalBefore ? formatUciMoveToBangla(evalBefore.bestMove, pos.fenBefore) : '',
              bestLine: evalBefore?.pv ? evalBefore.pv.split(' ').slice(0, 3) : [],
            });
            continue;
          }

          let classification: MoveClassification | undefined;
          let winDrop: number | undefined;
          let moveAccuracy: number | undefined;
          let explanation: string | undefined;

          if (pos.isUser) {
            // FIX 2: Explicitly handle evalAfter.mate === 0 (mover just delivered checkmate)
            if (evalAfter.mate === 0) {
              winDrop = 0;
              moveAccuracy = 100;
              userMoveAccuracies.push(moveAccuracy);
              classification = 'brilliant';
              brilliantCount++;
              explanation = 'দারুণ! সরাসরি চেকমেট দিয়ে খেলা জিতেছো।';
            } else {
              // Mover's win percentage before
              const winBefore = calculateWinPercent(evalBefore.cp, evalBefore.mate);
              // In fenAfter, score is from opponent perspective, so mover score is -opponentScore
              const moverCpAfter = typeof evalAfter.cp === 'number' ? -evalAfter.cp : undefined;
              const moverMateAfter =
                typeof evalAfter.mate === 'number' ? -evalAfter.mate : undefined;
              const winAfter = calculateWinPercent(moverCpAfter, moverMateAfter);

              winDrop = Math.max(0, winBefore - winAfter);
              moveAccuracy = calculateMoveAccuracy(winDrop);
              userMoveAccuracies.push(moveAccuracy);

              const isBest = pos.uci === evalBefore.bestMove;
              const missedMate = Boolean(
                evalBefore.mate &&
                  evalBefore.mate > 0 &&
                  (!evalAfter.mate || evalAfter.mate >= 0)
              );
              const allowedMate = Boolean(evalAfter.mate && evalAfter.mate > 0);

              classification = classifyMove(winDrop, isBest, missedMate, allowedMate);

              switch (classification) {
                case 'brilliant':
                  brilliantCount++;
                  break;
                case 'good':
                  goodCount++;
                  break;
                case 'inaccuracy':
                  inaccuracyCount++;
                  break;
                case 'mistake':
                  mistakeCount++;
                  break;
                case 'blunder':
                  blunderCount++;
                  break;
              }

              explanation = generateMoveExplanation(
                pos.fenBefore,
                pos.uci,
                evalBefore.bestMove,
                pos.fenAfter,
                evalBefore,
                evalAfter
              );
            }
          }

          // Extract best line (first 3 moves)
          const pvMoves = evalBefore.pv ? evalBefore.pv.split(' ').slice(0, 3) : [];

          reviewedMoves.push({
            ...pos,
            classification,
            evalBefore,
            evalAfter,
            winDrop,
            accuracy: moveAccuracy,
            explanation,
            bestMoveSan: formatUciMoveToBangla(evalBefore.bestMove, pos.fenBefore),
            bestLine: pvMoves,
          });
        }

        // FIX 4: Only fail if more than half of positions failed
        if (failedPositionsCount > totalPlies / 2) {
          throw new Error('More than half of the positions failed to evaluate.');
        }

        const overallAccuracy = calculateGameAccuracy(userMoveAccuracies);
        const finalAnalysis: GameAnalysis = {
          accuracy: overallAccuracy,
          brilliantCount,
          goodCount,
          inaccuracyCount,
          mistakeCount,
          blunderCount,
          moves: reviewedMoves,
        };

        if (!isCancelled) {
          cacheGameAnalysis(game.id, finalAnalysis);
          setAnalysis(finalAnalysis);

          // Extract personal mistake puzzles for spaced repetition review
          const extractedPuzzles = extractMistakePuzzles(game.id, reviewedMoves);
          if (extractedPuzzles.length > 0) {
            addPersonalPuzzles(extractedPuzzles);
          }

          if (reviewedMoves.length > 0) {
            setCurrentMoveIndex(0);
            setDisplayFen(reviewedMoves[0].fenAfter);
          }
        }

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        // If cancellation, ignore it
        if (isCancelled || errorMsg.toLowerCase().includes('cancel')) {
          console.log('[ReviewScreen] Analysis cancelled');
          return;
        }
        console.error('Review analysis error:', err);
        setEngineError(bn.ui.engineError);
        setTechnicalDetails(errorMsg || stockfishEngine.getLastError());
      } finally {
        // In the cancelled path, always reset isAnalyzing to false in finally
        setIsAnalyzing(false);
      }
    };

    runAnalysis();

    return () => {
      isCancelled = true;
      stockfishEngine.cancelQueue();
    };
  }, [game, analysis]);

  // Clean up any best line animation timeouts on unmount
  useEffect(() => {
    return () => {
      bestLineTimeoutRef.current.forEach((t) => window.clearTimeout(t));
      bestLineTimeoutRef.current = [];
    };
  }, []);

  const currentMove: ReviewedMove | null = useMemo(() => {
    if (!analysis || analysis.moves.length === 0) return null;
    return analysis.moves[currentMoveIndex] || null;
  }, [analysis, currentMoveIndex]);

  // Jump to specific move
  const goToMove = useCallback(
    (index: number) => {
      if (!analysis || index < 0 || index >= analysis.moves.length) return;
      bestLineTimeoutRef.current.forEach((t) => window.clearTimeout(t));
      bestLineTimeoutRef.current = [];
      setIsPlayingBestLine(false);
      setCurrentMoveIndex(index);
      setDisplayFen(analysis.moves[index].fenAfter);
    },
    [analysis]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToMove(currentMoveIndex - 1);
      } else if (e.key === 'ArrowRight') {
        goToMove(currentMoveIndex + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentMoveIndex, goToMove]);

  // "সঠিক চালটা দেখাও" - Plays the best line (first 3 moves of pv) on the board
  const handleShowBestLine = useCallback(() => {
    if (!currentMove || !currentMove.bestLine || currentMove.bestLine.length === 0) return;

    bestLineTimeoutRef.current.forEach((t) => window.clearTimeout(t));
    bestLineTimeoutRef.current = [];

    setIsPlayingBestLine(true);
    const simChess = new Chess(currentMove.fenBefore);
    const lineMoves = currentMove.bestLine;

    lineMoves.forEach((uci, idx) => {
      const timeout = window.setTimeout(() => {
        try {
          if (uci.length >= 4) {
            const from = uci.slice(0, 2);
            const to = uci.slice(2, 4);
            const promo = uci[4];
            simChess.move({ from, to, promotion: promo });
            setDisplayFen(simChess.fen());
          }
        } catch (err) {
          console.warn('Error simulating best line:', err);
        }

        if (idx === lineMoves.length - 1) {
          const resetTimeout = window.setTimeout(() => {
            setIsPlayingBestLine(false);
          }, 1500);
          bestLineTimeoutRef.current.push(resetTimeout);
        }
      }, (idx + 1) * 750);

      bestLineTimeoutRef.current.push(timeout);
    });
  }, [currentMove]);

  // Reset back to current reviewed move position
  const handleResetToMove = useCallback(() => {
    bestLineTimeoutRef.current.forEach((t) => window.clearTimeout(t));
    bestLineTimeoutRef.current = [];
    setIsPlayingBestLine(false);
    if (currentMove) {
      setDisplayFen(currentMove.fenAfter);
    }
  }, [currentMove]);

  // Board arrows for mistakes: red for played move, green for best move
  const reviewArrows: Arrow[] = useMemo(() => {
    if (!currentMove || !currentMove.isUser || isPlayingBestLine) return [];
    const arrows: Arrow[] = [];

    const isMistake =
      currentMove.classification === 'inaccuracy' ||
      currentMove.classification === 'mistake' ||
      currentMove.classification === 'blunder';

    if (isMistake) {
      // Red arrow for played move
      if (currentMove.uci && currentMove.uci.length >= 4) {
        arrows.push({
          startSquare: currentMove.uci.slice(0, 2),
          endSquare: currentMove.uci.slice(2, 4),
          color: '#E53935',
        });
      }
      // Green arrow for engine's best move
      const best = currentMove.evalBefore?.bestMove;
      if (best && best.length >= 4) {
        arrows.push({
          startSquare: best.slice(0, 2),
          endSquare: best.slice(2, 4),
          color: '#43A047',
        });
      }
    } else if (currentMove.classification === 'brilliant') {
      if (currentMove.uci && currentMove.uci.length >= 4) {
        arrows.push({
          startSquare: currentMove.uci.slice(0, 2),
          endSquare: currentMove.uci.slice(2, 4),
          color: '#1E88E5',
        });
      }
    }

    return arrows;
  }, [currentMove, isPlayingBestLine]);

  // Highlight squares for played move
  const squareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    if (currentMove && currentMove.uci && currentMove.uci.length >= 4) {
      const from = currentMove.uci.slice(0, 2);
      const to = currentMove.uci.slice(2, 4);
      styles[from] = { backgroundColor: 'rgba(224, 164, 58, 0.25)' };
      styles[to] = { backgroundColor: 'rgba(224, 164, 58, 0.35)' };
    }
    return styles;
  }, [currentMove]);

  const { settings } = useSettings();
  const boardThemeColors = getBoardTheme(settings.boardTheme);

  // Single most impactful blunder/mistake for "এই খেলায় তুমি কী শিখলে"
  const criticalMove: ReviewedMove | null = useMemo(() => {
    if (!analysis) return null;
    const userBlundersAndMistakes = analysis.moves.filter(
      (m) => m.isUser && (m.classification === 'blunder' || m.classification === 'mistake')
    );
    if (userBlundersAndMistakes.length === 0) return null;
    userBlundersAndMistakes.sort((a, b) => (b.winDrop || 0) - (a.winDrop || 0));
    return userBlundersAndMistakes[0];
  }, [analysis]);

  if (!game) {

    return (
      <div className="max-w-md mx-auto px-4 py-12 space-y-4">
        <EmptyState
          title="কোনো খেলা পাওয়া যায়নি"
          description="রিভিউ করার জন্য প্রথমে বটের সাথে একটি খেলা সম্পন্ন করুন।"
          actionLabel={bn.home.startPlayCTA}
          onAction={() => navigate('/play')}
        />
        <div className="text-center pt-2">
          <Button
            onClick={loadScholarMateTest}
            variant="secondary"
            size="sm"
          >
            🧪 টেস্ট চেকমেট গেম বিশ্লেষণ (Scholar's Mate)
          </Button>
        </div>
      </div>
    );
  }

  if (engineError) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <ErrorState
          title={bn.ui.engineError}
          message="রিভিউ বিশ্লেষণ সম্পন্ন করতে স্টকফিশ ইঞ্জিন ব্যর্থ হয়েছে।"
          technicalDetails={technicalDetails || stockfishEngine.getLastError()}
          onRetry={() => {
            analysisStartedForGameIdRef.current = null;
            stockfishEngine.reset();
            window.location.reload();
          }}
        />
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 space-y-6 text-center">
        <div className="w-16 h-16 mx-auto bg-[#E6F2EC] text-[#1F6F50] rounded-2xl flex items-center justify-center text-3xl shadow-sm animate-pulse">
          🔍
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1E2420]">{bn.review.analyzingTitle}</h2>
          <p className="text-xs text-[#6B726D] mt-1">{bn.review.analyzingSubtitle}</p>
        </div>
        <ProgressBar
          current={analyzingProgress.current}
          total={analyzingProgress.total}
          label="বিশ্লেষণ চলছে..."
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-4">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          {bn.ui.back}
        </Button>
        <div className="flex items-center gap-3">
          <button
            onClick={loadScholarMateTest}
            className="text-xs text-[#1F6F50] hover:text-[#1F6F50]/80 underline font-medium cursor-pointer"
            title="Scholar's Mate 4-move checkmate"
          >
            🧪 টেস্ট চেকমেট গেম
          </button>
          <span className="text-xs font-mono text-[#6B726D]">
            বট লেভেল {toBanglaNumeral(game.botLevel)} · {toBanglaNumeral(game.movesCount)} চাল
          </span>
        </div>
      </div>

      {/* Teacher Summary: What you learned from this game */}
      {analysis && (
        <LessonLearnedCard
          criticalMove={criticalMove}
          userColor={game.userColor}
          boardThemeColors={boardThemeColors}
        />
      )}

      {/* Summary Card */}
      {analysis && <ReviewSummary analysis={analysis} />}

      {/* Main Review Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Eval Bar + Chessboard */}
        <div className="lg:col-span-8 flex flex-col items-center gap-3">
          <div className="flex items-center justify-center gap-2 sm:gap-3 w-full">
            {/* Eval Bar beside board */}
            <EvalBar
              cp={currentMove?.evalAfter?.cp}
              mate={currentMove?.evalAfter?.mate}
              userColor={game.userColor}
            />

            {/* Board */}
            <div
              className="w-full max-w-[420px] aspect-square rounded-xl overflow-hidden shadow-card border border-app select-none transition-colors"
              style={{ backgroundColor: boardThemeColors.light }}
            >
              <Chessboard
                key={`review-board-${settings.boardTheme}-${settings.showCoordinates}`}
                options={{
                  position: displayFen,
                  boardOrientation: game.userColor,
                  arrows: reviewArrows,
                  squareStyles,
                  darkSquareStyle: { backgroundColor: boardThemeColors.dark },
                  lightSquareStyle: { backgroundColor: boardThemeColors.light },
                  darkSquareNotationStyle: { color: boardThemeColors.light },
                  lightSquareNotationStyle: { color: boardThemeColors.dark },
                  showNotation: settings.showCoordinates,
                  allowDragging: false,
                }}
              />
            </div>
          </div>


          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-2 w-full max-w-[420px]">
            <Button
              onClick={() => goToMove(0)}
              disabled={currentMoveIndex === 0}
              variant="secondary"
              size="sm"
              aria-label={bn.review.firstMove}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => goToMove(currentMoveIndex - 1)}
              disabled={currentMoveIndex === 0}
              variant="secondary"
              size="sm"
              className="flex-1"
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              {bn.review.prevMove}
            </Button>
            <span className="text-xs font-mono text-[#6B726D] px-2 select-none">
              {toBanglaNumeral(currentMoveIndex + 1)} /{' '}
              {toBanglaNumeral(analysis?.moves.length || 0)}
            </span>
            <Button
              onClick={() => goToMove(currentMoveIndex + 1)}
              disabled={!analysis || currentMoveIndex >= analysis.moves.length - 1}
              variant="secondary"
              size="sm"
              className="flex-1"
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              {bn.review.nextMove}
            </Button>
            <Button
              onClick={() => goToMove((analysis?.moves.length || 1) - 1)}
              disabled={!analysis || currentMoveIndex >= analysis.moves.length - 1}
              variant="secondary"
              size="sm"
              aria-label={bn.review.lastMove}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>

          {isPlayingBestLine && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#1F6F50] animate-pulse">
                {bn.review.showingLine}
              </span>
              <button
                onClick={handleResetToMove}
                className="text-xs text-[#6B726D] hover:text-[#1E2420] underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>পুনরায় স্থাপন</span>
              </button>
            </div>
          )}

          {/* Explanation Card below board */}
          <div className="w-full max-w-[480px]">
            <ExplanationCard
              move={currentMove}
              onShowBestLine={handleShowBestLine}
              isPlayingLine={isPlayingBestLine}
            />
          </div>
        </div>

        {/* Right: Scrollable Move List */}
        <div className="lg:col-span-4 bg-[#FFFDF8] rounded-xl border border-[#1E2420]/15 p-3 shadow-card max-h-[500px] flex flex-col">
          <h3 className="text-sm font-bold text-[#1E2420] pb-2 border-b border-[#1E2420]/10 flex items-center justify-between">
            <span>চাল তালিকা</span>
            <span className="text-xs font-mono text-[#6B726D]">
              {toBanglaNumeral(analysis?.moves.length || 0)} টি চাল
            </span>
          </h3>

          <div className="flex-1 overflow-y-auto space-y-1 pt-2 pr-1">
            {analysis?.moves.map((m, idx) => {
              const isSelected = idx === currentMoveIndex;
              const qualityInfo = m.classification
                ? bn.review.qualities[m.classification]
                : null;

              return (
                <button
                  key={idx}
                  onClick={() => goToMove(idx)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer touch-target ${
                    isSelected
                      ? 'bg-[#1F6F50] text-[#FFFDF8] font-bold shadow-xs'
                      : 'hover:bg-[#F4EFE4] text-[#1E2420]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={isSelected ? 'text-[#FFFDF8]/70' : 'text-[#6B726D]'}>
                      {toBanglaNumeral(Math.floor(idx / 2) + 1)}
                      {idx % 2 === 0 ? '.' : '...'}
                    </span>
                    <span>{m.san}</span>
                  </div>

                  {qualityInfo && (
                    <span className="flex items-center gap-1">
                      <span>{qualityInfo.icon}</span>
                      <span className="text-[10px]">{qualityInfo.label}</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
