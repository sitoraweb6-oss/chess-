import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Chess, Square } from 'chess.js';
import { Chessboard, Arrow } from 'react-chessboard';
import { Sparkles, Trophy, RotateCcw, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { ChessOpening } from '../../domain/openings.ts';
import { updateOpeningProgress, getOpeningProgress } from '../../storage/index.ts';
import { bn, toBanglaNumeral } from '../../i18n/bn.ts';
import { playMoveSound, playCaptureSound, playCheckSound, playVictorySound } from '../../utils/sound.ts';
import { getStorageData } from '../../storage/index.ts';
import { BOARD_THEMES, ANIMATION_SPEEDS, getBoardTheme } from '../../utils/theme.ts';
import { useSettings } from '../../hooks/useSettings.ts';


export interface OpeningPracticeViewProps {
  opening: ChessOpening;
  onSwitchToLesson: () => void;
}

export const OpeningPracticeView: React.FC<OpeningPracticeViewProps> = ({
  opening,
  onSwitchToLesson,
}) => {
  const chessRef = useRef<Chess>(new Chess());
  const [fen, setFen] = useState<string>(chessRef.current.fen());
  const [currentPlyIndex, setCurrentPlyIndex] = useState<number>(0);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);

  // Practice state
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [wrongAttemptsOnCurrentMove, setWrongAttemptsOnCurrentMove] = useState<number>(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string>(bn.openings.practiceGoal);
  const [feedbackType, setFeedbackType] = useState<'neutral' | 'success' | 'warning' | 'error'>('neutral');
  const [answerArrow, setAnswerArrow] = useState<Arrow | null>(null);

  // Scoring
  const [userErrorsCount, setUserErrorsCount] = useState<number>(0);
  const [isPracticeComplete, setIsPracticeComplete] = useState<boolean>(false);
  const [finalScore, setFinalScore] = useState<number>(100);

  const { settings } = useSettings();
  const soundEnabled = settings.sound;
  const userSide = opening.forColor; // 'white' | 'black'
  const boardThemeColors = getBoardTheme(settings.boardTheme);


  // Initialize practice game
  const resetPractice = useCallback(() => {
    chessRef.current = new Chess();
    setFen(chessRef.current.fen());
    setCurrentPlyIndex(0);
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setAnswerArrow(null);
    setIsBotThinking(false);
    setWrongAttemptsOnCurrentMove(0);
    setFeedbackMessage(bn.openings.practiceGoal);
    setFeedbackType('neutral');
    setUserErrorsCount(0);
    setIsPracticeComplete(false);

    // If opening is for black, bot plays the first move (ply 1)
    if (userSide === 'black') {
      setTimeout(() => {
        makeOpponentMove(0);
      }, 500);
    }
  }, [userSide, opening]);

  useEffect(() => {
    resetPractice();
  }, [opening.id, resetPractice]);

  // Execute opponent move from opening moves array
  const makeOpponentMove = (plyIdx: number) => {
    if (plyIdx >= opening.moves.length) return;
    setIsBotThinking(true);

    setTimeout(() => {
      const step = opening.moves[plyIdx];
      try {
        const moveRes = chessRef.current.move(step.san);
        if (moveRes) {
          if (moveRes.captured) {
            playCaptureSound(soundEnabled);
          } else {
            playMoveSound(soundEnabled);
          }
          setLastMove({ from: moveRes.from, to: moveRes.to });
          setFen(chessRef.current.fen());
          setCurrentPlyIndex(plyIdx + 1);
          setAnswerArrow(null);
          setWrongAttemptsOnCurrentMove(0);
          setFeedbackMessage(`${bn.openings.yourMovePrompt} আপনার পরবর্তী চাল দিন।`);
          setFeedbackType('neutral');
        }
      } catch (err) {
        console.error('Error making opponent move:', err);
      } finally {
        setIsBotThinking(false);
      }
    }, 600);
  };

  // Check if practice completed
  const handlePracticeCompletion = (errors: number) => {
    const userMovesCount = Math.ceil(opening.moves.length / 2);
    // Score formula: starts at 100, drops proportionally with errors
    const calculatedScore = Math.max(30, Math.round(100 - (errors / userMovesCount) * 45));
    setFinalScore(calculatedScore);
    setIsPracticeComplete(true);
    playVictorySound(soundEnabled);

    updateOpeningProgress(opening.id, {
      practiceScore: calculatedScore,
      completedLesson: true,
      attempts: 1,
    });
  };

  // Verify and execute user move
  const handleUserMove = (from: Square, to: Square): boolean => {
    if (isBotThinking || isPracticeComplete) return false;

    // Check if it's user's turn
    const turn = chessRef.current.turn();
    const isUserTurn =
      (turn === 'w' && userSide === 'white') || (turn === 'b' && userSide === 'black');
    if (!isUserTurn) return false;

    const expectedMove = opening.moves[currentPlyIndex];
    if (!expectedMove) return false;

    // Test move legally without throwing
    let attemptedMove: ReturnType<Chess['move']> | null = null;
    try {
      const tempChess = new Chess(chessRef.current.fen());
      const piece = tempChess.get(from);
      const isPromo =
        piece?.type === 'p' &&
        ((piece.color === 'w' && to[1] === '8') || (piece.color === 'b' && to[1] === '1'));

      attemptedMove = tempChess.move({
        from,
        to,
        promotion: isPromo ? 'q' : undefined,
      });
    } catch {
      // Illegal board move (e.g. invalid piece destination like g2 to g5)
      setSelectedSquare(null);
      setLegalMoves([]);
      return false;
    }

    if (!attemptedMove) return false;

    // Check if attempted move matches expected opening SAN
    if (attemptedMove.san === expectedMove.san) {
      // Correct move!
      try {
        chessRef.current.move({
          from,
          to,
          promotion: attemptedMove.promotion,
        });
      } catch {
        return false;
      }
      if (attemptedMove.captured) {
        playCaptureSound(soundEnabled);
      } else {
        playMoveSound(soundEnabled);
      }
      if (chessRef.current.inCheck()) {
        playCheckSound(soundEnabled);
      }

      setLastMove({ from, to });
      setFen(chessRef.current.fen());
      setSelectedSquare(null);
      setLegalMoves([]);
      setAnswerArrow(null);
      setWrongAttemptsOnCurrentMove(0);
      setFeedbackMessage(bn.openings.correctMoveFeedback);
      setFeedbackType('success');

      const nextPly = currentPlyIndex + 1;
      setCurrentPlyIndex(nextPly);

      if (nextPly >= opening.moves.length) {
        // Finished all moves in opening
        setTimeout(() => {
          handlePracticeCompletion(userErrorsCount);
        }, 400);
      } else {
        // Bot plays next move
        makeOpponentMove(nextPly);
      }
      return true;
    } else {
      // Wrong move!
      const attempts = wrongAttemptsOnCurrentMove + 1;
      setWrongAttemptsOnCurrentMove(attempts);
      setUserErrorsCount((prev) => prev + 1);

      if (attempts === 1) {
        setFeedbackMessage(bn.openings.wrongMoveHint1);
        setFeedbackType('warning');
      } else {
        // Show answer arrow and hint
        if (expectedMove.uci && expectedMove.uci.length >= 4) {
          const expectedFrom = expectedMove.uci.slice(0, 2);
          const expectedTo = expectedMove.uci.slice(2, 4);
          setAnswerArrow({
            startSquare: expectedFrom,
            endSquare: expectedTo,
            color: '#43A047',
          });
        }
        setFeedbackMessage(
          bn.openings.wrongMoveHint2.replace('{move}', expectedMove.san)
        );
        setFeedbackType('error');
      }

      setSelectedSquare(null);
      setLegalMoves([]);
      return false;
    }
  };

  // Drag and drop handler
  const handlePieceDrop = ({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string;
    targetSquare: string | null;
  }): boolean => {
    if (!targetSquare) return false;
    return handleUserMove(sourceSquare as Square, targetSquare as Square);
  };

  // Square click handler (tap to move support)
  const handleSquareClick = ({ square }: { square: string }) => {
    if (isBotThinking || isPracticeComplete) return;

    const sq = square as Square;
    const turn = chessRef.current.turn();
    const isUserTurn =
      (turn === 'w' && userSide === 'white') || (turn === 'b' && userSide === 'black');
    if (!isUserTurn) return;

    if (selectedSquare) {
      if (selectedSquare === sq) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      const moves = chessRef.current.moves({ square: selectedSquare, verbose: true });
      const matchingMove = moves.find((m) => m.to === sq);

      if (matchingMove) {
        handleUserMove(selectedSquare, sq);
        return;
      }
    }

    const piece = chessRef.current.get(sq);
    if (
      piece &&
      ((piece.color === 'w' && userSide === 'white') ||
        (piece.color === 'b' && userSide === 'black'))
    ) {
      setSelectedSquare(sq);
      const moves = chessRef.current.moves({ square: sq, verbose: true });
      setLegalMoves(moves.map((m) => m.to as Square));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  // Custom square styles
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    legalMoves.forEach((sq) => {
      const target = chessRef.current.get(sq);
      styles[sq] = {
        background: target
          ? 'radial-gradient(circle, rgba(224, 164, 58, 0.7) 80%, transparent 80%)'
          : 'radial-gradient(circle, rgba(31, 111, 80, 0.45) 25%, transparent 26%)',
        borderRadius: '50%',
      };
    });

    if (selectedSquare) {
      styles[selectedSquare] = { backgroundColor: 'rgba(224, 164, 58, 0.4)' };
    }

    if (lastMove) {
      styles[lastMove.from] = { backgroundColor: 'rgba(224, 164, 58, 0.25)' };
      styles[lastMove.to] = { backgroundColor: 'rgba(224, 164, 58, 0.35)' };
    }

    return styles;
  }, [legalMoves, selectedSquare, lastMove]);

  const feedbackColors = {
    neutral: 'bg-surface-2 text-fg border-border',
    success: 'bg-success/15 text-success border-success/30 font-medium',
    warning: 'bg-accent-soft text-accent border-accent/40 font-medium',
    error: 'bg-danger-soft text-danger border-danger/40 font-medium',
  };

  return (
    <div className="space-y-4">
      {/* Practice Header Info */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-primary bg-primary-soft px-2.5 py-1 rounded-full">
            পক্ষ: {opening.forColorBn}
          </span>
          <span className="text-xs font-mono text-muted">
            অগ্রগতি: {toBanglaNumeral(currentPlyIndex)} / {toBanglaNumeral(opening.moves.length)}
          </span>
        </div>
        <Button
          onClick={resetPractice}
          variant="ghost"
          size="sm"
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          পুনরায় শুরু
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left: Chessboard */}
        <div className="md:col-span-7 flex flex-col items-center gap-3">
          <div
            className="w-full max-w-[420px] aspect-square rounded-xl overflow-hidden shadow-card border border-app select-none transition-colors"
            style={{ backgroundColor: boardThemeColors.light }}
          >
            <Chessboard
              key={`practice-board-${settings.boardTheme}-${settings.showCoordinates}-${settings.animationSpeed}`}
              options={{
                position: fen,
                boardOrientation: opening.forColor,
                onPieceDrop: handlePieceDrop,
                onSquareClick: handleSquareClick,
                squareStyles: customSquareStyles,
                arrows: answerArrow ? [answerArrow] : [],
                darkSquareStyle: { backgroundColor: boardThemeColors.dark },
                lightSquareStyle: { backgroundColor: boardThemeColors.light },
                darkSquareNotationStyle: { color: boardThemeColors.light },
                lightSquareNotationStyle: { color: boardThemeColors.dark },
                showNotation: settings.showCoordinates,
                animationDurationInMs: ANIMATION_SPEEDS[settings.animationSpeed] || 200,
              }}
            />
          </div>


          {isBotThinking && (
            <div className="flex items-center gap-2 text-xs font-medium text-primary animate-pulse">
              <span>প্রতিপক্ষ ভাবছে...</span>
            </div>
          )}
        </div>

        {/* Right: Feedback & Guidance */}
        <div className="md:col-span-5 space-y-4">
          <Card
            variant="surface"
            className={`p-4 sm:p-5 border transition-all ${feedbackColors[feedbackType]}`}
          >
            <div className="flex items-start gap-2.5">
              {feedbackType === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
              ) : feedbackType === 'error' || feedbackType === 'warning' ? (
                <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
              ) : (
                <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider block opacity-80">
                  শিক্ষকের নির্দেশনা
                </span>
                <p className="text-sm leading-relaxed">{feedbackMessage}</p>
              </div>
            </div>
          </Card>

          <Card variant="surface-2" className="p-4 space-y-2 border-border">
            <h4 className="text-xs font-bold text-fg">অনুশীলন নিয়ম:</h4>
            <ul className="text-xs text-muted space-y-1 list-disc list-inside">
              <li>প্রথমবার ভুল চাল দিলে শিক্ষক চিন্তার সূত্র দেবেন।</li>
              <li>দ্বিতীয়বার ভুল হলে বোর্ডে সবুজ তীরচিহ্নে সঠিক চাল নির্দেশিত হবে।</li>
              <li>সঠিকভাবে চাল দিলে স্বয়ংক্রিয়ভাবে পরবর্তী চালে চলে যাবে।</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Completion Modal */}
      <Modal isOpen={isPracticeComplete} onClose={() => {}} title="" maxWidth="md">
        <div className="text-center py-2 space-y-4">
          <div className="w-16 h-16 mx-auto bg-primary-soft text-primary rounded-2xl flex items-center justify-center text-3xl shadow-xs">
            <Trophy className="w-8 h-8 text-primary" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-fg">
              {bn.openings.practiceSuccessTitle}
            </h3>
            <p className="text-xs sm:text-sm text-muted mt-1 max-w-sm mx-auto">
              আপনি {opening.nameBn}-এর মূল লাইনগুলো সফলভাবে আয়ত্ত করেছেন!
            </p>
          </div>

          <div className="inline-flex items-center gap-2 bg-surface-2 px-4 py-2 rounded-xl border border-border">
            <span className="text-xs text-muted">{bn.openings.practiceScoreLabel}</span>
            <span className="text-xl font-bold font-mono text-primary">
              {toBanglaNumeral(finalScore)}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <Button
              onClick={resetPractice}
              variant="secondary"
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              আবার খেলো
            </Button>
            <Button
              onClick={onSwitchToLesson}
              variant="primary"
              leftIcon={<BookOpen className="w-4 h-4" />}
            >
              পাঠ পর্যালোচনা
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
