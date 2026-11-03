import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chess, Square, PieceSymbol } from 'chess.js';
import { Chessboard, Arrow } from 'react-chessboard';
import { Sparkles, Trophy, RotateCw, Flag, Award, Lock } from 'lucide-react';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { Toast } from '../../components/ui/Toast.tsx';
import { EvalBar } from '../review/EvalBar.tsx';
import { PromotionModal } from '../play/PromotionModal.tsx';
import { SoloControls } from './SoloControls.tsx';
import { SoloHintCard } from './SoloHintCard.tsx';
import { SoloMoveHistory } from './SoloMoveHistory.tsx';
import { SoloBrainModal } from './SoloBrainModal.tsx';
import { SoloLockScreen } from './SoloLockScreen.tsx';
import { isSoloFeatureUnlocked, setSoloFeatureUnlocked } from '../../utils/security.ts';
import { bn, toBanglaNumeral } from '../../i18n/bn.ts';
import { stockfishEngine, EvaluationResult } from '../../engine/index.ts';
import { evaluateFenSafe } from '../../engine/evaluator.ts';
import { explainBestMove, BestMoveExplanation } from '../../domain/bestMoveExplanation.ts';
import {
  getSkillLevelFromElo,
  getMoveTimeFromElo,
  getMaxDepthFromElo,
  getEloBrainTitleBn,
} from '../../domain/rating.ts';
import { saveCompletedGame, GameRecord } from '../../storage/index.ts';
import {
  playMoveSound,
  playCaptureSound,
  playCheckSound,
  playVictorySound,
} from '../../utils/sound.ts';
import {
  BOARD_THEMES,
  ANIMATION_SPEEDS,
  getBoardTheme,
} from '../../utils/theme.ts';
import { useSettings } from '../../hooks/useSettings.ts';

export const SoloPlayScreen: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();

  // Passcode Lock Protection for Solo Sandbox (cryptographically secured)
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => isSoloFeatureUnlocked());

  const handleLockSolo = () => {
    setSoloFeatureUnlocked(false);
    setIsUnlocked(false);
  };

  // Engine Brain Level (ELO rating) - defaults to 2000, persisted in localStorage
  const [engineElo, setEngineElo] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('dabaShikkhok:soloEngineElo');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 800 && parsed <= 2600) return parsed;
      }
    } catch {}
    return 2000;
  });
  const [showBrainModal, setShowBrainModal] = useState<boolean>(false);

  const handleSelectElo = (newElo: number) => {
    setEngineElo(newElo);
    try {
      localStorage.setItem('dabaShikkhok:soloEngineElo', String(newElo));
    } catch {}
    setToastMessage(`ইঞ্জিন ব্রেন লেভেল সফলভাবে ${toBanglaNumeral(newElo)} এলো-তে নির্ধারণ করা হয়েছে।`);
  };

  // Chess instance & position state
  const chessRef = useRef<Chess>(new Chess());
  const [fen, setFen] = useState<string>(chessRef.current.fen());
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [autoFlip, setAutoFlip] = useState<boolean>(false);
  const [showEvalBar, setShowEvalBar] = useState<boolean>(true);

  // Moves history tracking
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(0);
  const positionsHistoryRef = useRef<string[]>([chessRef.current.fen()]);

  // Board interaction state
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [hintArrow, setHintArrow] = useState<Arrow | null>(null);
  const [hintHighlight, setHintHighlight] = useState<{ from: Square; to: Square } | null>(null);

  // Unlimited Best Hint state
  const [isHintLoading, setIsHintLoading] = useState<boolean>(false);
  const [bestHint, setBestHint] = useState<BestMoveExplanation | null>(null);

  // Live Position Evaluation
  const [currentEval, setCurrentEval] = useState<EvaluationResult>({ bestMove: '', pv: '' });

  // Modals & Notifications
  const [showPromotion, setShowPromotion] = useState<boolean>(false);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [showNewGameModal, setShowNewGameModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Game over state
  const [gameOverInfo, setGameOverInfo] = useState<{
    result: 'win-white' | 'win-black' | 'draw';
    title: string;
    description: string;
  } | null>(null);

  // Initialize engine
  useEffect(() => {
    stockfishEngine.init().catch((err) => console.warn('[SoloPlay] Engine init error:', err));
  }, []);

  // Update evaluation whenever FEN changes
  useEffect(() => {
    let isCancelled = false;
    evaluateFenSafe(fen, { movetime: 250 })
      .then((res) => {
        if (!isCancelled) {
          setCurrentEval(res);
        }
      })
      .catch((err) => console.warn('[SoloPlay] Eval error:', err));

    return () => {
      isCancelled = true;
    };
  }, [fen]);

  // Check Game Over status
  const checkGameOver = useCallback((): boolean => {
    const chess = chessRef.current;
    if (chess.isCheckmate()) {
      const winner = chess.turn() === 'w' ? 'black' : 'white';
      playVictorySound(settings.sound);
      setGameOverInfo({
        result: winner === 'white' ? 'win-white' : 'win-black',
        title: winner === 'white' ? bn.solo.checkmateWhiteWins : bn.solo.checkmateBlackWins,
        description: `${winner === 'white' ? 'সাদা' : 'কালো'} পক্ষ অসাধারণ রণকৌশলে বিজয় অর্জন করেছে!`,
      });
      return true;
    }
    if (chess.isStalemate()) {
      setGameOverInfo({
        result: 'draw',
        title: bn.solo.stalemate,
        description: 'রাজার যাওয়ার মতো কোনো বৈধ ঘর নেই এবং রাজা চেক অবস্থায় নেই।',
      });
      return true;
    }
    if (chess.isThreefoldRepetition()) {
      setGameOverInfo({
        result: 'draw',
        title: bn.solo.drawRepetition,
        description: 'একই পজিশন বোর্ডে তিনবার পুনরাবৃত্তি হওয়ায় খেলাটি ড্র ঘোষিত হলো।',
      });
      return true;
    }
    if (chess.isInsufficientMaterial()) {
      setGameOverInfo({
        result: 'draw',
        title: bn.solo.drawInsufficient,
        description: 'বোর্ডে কোনো পক্ষেরই চেকমেট দেওয়ার মতো পর্যাপ্ত ঘুঁটি অবশিষ্ট নেই।',
      });
      return true;
    }
    if (chess.isDrawByFiftyMoves()) {
      setGameOverInfo({
        result: 'draw',
        title: bn.solo.drawFifty,
        description: '৫০ চালে কোনো সৈন্যের চাল বা ঘুঁটি কাটাকাটি না হওয়ায় খেলা ড্র।',
      });
      return true;
    }
    return false;
  }, [settings.sound]);

  // Execute a move on the board
  const executeMove = useCallback(
    (from: Square, to: Square, promotionPiece?: PieceSymbol): boolean => {
      try {
        const moveRes = chessRef.current.move({
          from,
          to,
          promotion: promotionPiece,
        });
        if (!moveRes) return false;

        const newFen = chessRef.current.fen();
        setFen(newFen);
        setLastMove({ from, to });
        setSelectedSquare(null);
        setLegalMoves([]);
        setHintArrow(null);
        setHintHighlight(null);
        setBestHint(null);

        // Sound effects
        if (moveRes.captured) {
          playCaptureSound(settings.sound);
        } else {
          playMoveSound(settings.sound);
        }
        if (chessRef.current.inCheck()) {
          playCheckSound(settings.sound);
        }

        // History tracking
        const nextMoves = chessRef.current.history();
        setMoveHistory(nextMoves);
        setCurrentMoveIndex(nextMoves.length);
        positionsHistoryRef.current = positionsHistoryRef.current
          .slice(0, nextMoves.length)
          .concat(newFen);

        // Auto-flip orientation if active
        if (autoFlip) {
          setBoardOrientation(chessRef.current.turn() === 'w' ? 'white' : 'black');
        }

        checkGameOver();
        return true;
      } catch {
        return false;
      }
    },
    [settings.sound, autoFlip, checkGameOver]
  );

  // Request Unlimited Best Hint from Stockfish
  const handleGetBestHint = async () => {
    if (chessRef.current.isGameOver()) return;

    setIsHintLoading(true);
    setToastMessage(null);

    try {
      const currentFen = chessRef.current.fen();

      // Compute skill level, search time, and search depth cap dynamically from user-selected ELO
      const skillLevel = getSkillLevelFromElo(engineElo);
      const moveTime = getMoveTimeFromElo(engineElo);
      const maxDepth = getMaxDepthFromElo(engineElo);

      // Get best move strictly calibrated to selected engine brain level
      const [bestMoveUci, evalRes] = await Promise.all([
        stockfishEngine.getBestMove(currentFen, {
          skillLevel,
          movetime: moveTime,
          depth: maxDepth,
        }),
        evaluateFenSafe(currentFen, { movetime: 350 }),
      ]);

      if (bestMoveUci && bestMoveUci.length >= 4) {
        const from = bestMoveUci.slice(0, 2) as Square;
        const to = bestMoveUci.slice(2, 4) as Square;

        // Visual golden arrow on the board
        setHintArrow({
          startSquare: from,
          endSquare: to,
          color: 'rgba(224, 164, 58, 0.9)',
        });
        setHintHighlight({ from, to });

        // Bangla Explanation Card with ELO awareness
        const explanation = explainBestMove(currentFen, bestMoveUci, evalRes, engineElo);
        setBestHint(explanation);
      }
    } catch (err) {
      console.warn('[SoloPlay] Error fetching best hint:', err);
    } finally {
      setIsHintLoading(false);
    }
  };

  // Play the best hint directly
  const handleApplyHintMove = () => {
    if (!bestHint) return;
    executeMove(bestHint.from, bestHint.to);
  };

  // Clear current hint
  const handleClearHint = () => {
    setBestHint(null);
    setHintArrow(null);
    setHintHighlight(null);
  };

  // Undo move
  const handleUndoMove = () => {
    if (moveHistory.length === 0) return;

    chessRef.current.undo();
    const newFen = chessRef.current.fen();
    setFen(newFen);
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    handleClearHint();
    setGameOverInfo(null);

    const nextMoves = chessRef.current.history();
    setMoveHistory(nextMoves);
    setCurrentMoveIndex(nextMoves.length);
  };

  // Redo move (if supported from history)
  const handleRedoMove = () => {
    // Replay move from positionsHistoryRef
    if (currentMoveIndex < positionsHistoryRef.current.length - 1) {
      const targetFen = positionsHistoryRef.current[currentMoveIndex + 1];
      try {
        const nextChess = new Chess(targetFen);
        chessRef.current = nextChess;
        setFen(targetFen);
        setCurrentMoveIndex((prev) => prev + 1);
        setMoveHistory(nextChess.history());
        handleClearHint();
        checkGameOver();
      } catch (err) {
        console.warn('Redo failed:', err);
      }
    }
  };

  // Jump to specific move index in history
  const handleSelectMoveIndex = (idx: number) => {
    if (idx >= 0 && idx < positionsHistoryRef.current.length) {
      const targetFen = positionsHistoryRef.current[idx];
      try {
        const tempChess = new Chess(targetFen);
        chessRef.current = tempChess;
        setFen(targetFen);
        setCurrentMoveIndex(idx);
        setSelectedSquare(null);
        setLegalMoves([]);
        handleClearHint();
      } catch (e) {
        console.warn('Navigation failed:', e);
      }
    }
  };

  // Start new clean game
  const handleResetGame = () => {
    stockfishEngine.newGame().catch(() => {});
    const cleanChess = new Chess();
    chessRef.current = cleanChess;
    setFen(cleanChess.fen());
    setMoveHistory([]);
    setCurrentMoveIndex(0);
    positionsHistoryRef.current = [cleanChess.fen()];
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    handleClearHint();
    setGameOverInfo(null);
    setShowNewGameModal(false);
  };

  // Copy PGN to clipboard
  const handleCopyPgn = () => {
    const pgn = chessRef.current.pgn() || '1. e4';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pgn).then(() => {
        setToastMessage(bn.solo.pgnCopied);
      });
    }
  };

  // Review game in review screen
  const handleReviewThisGame = () => {
    const gameId = `solo-${Date.now()}`;
    const record: GameRecord = {
      id: gameId,
      pgn: chessRef.current.pgn(),
      fen: chessRef.current.fen(),
      userColor: 'white',
      botLevel: 5,
      date: new Date().toISOString(),
      result: gameOverInfo?.result === 'win-white' ? 'win' : gameOverInfo?.result === 'win-black' ? 'loss' : 'draw',
      resultReason: gameOverInfo?.title || 'স্ব-অনুশীলন খেলা',
      accuracy: 0,
      movesCount: chessRef.current.history().length,
    };
    saveCompletedGame(record, 0, 1000);
    navigate(`/review/${gameId}`);
  };

  // Drag and drop piece handler
  const handlePieceDrop = ({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string;
    targetSquare: string | null;
  }): boolean => {
    if (!targetSquare) return false;

    const piece = chessRef.current.get(sourceSquare as Square);
    if (!piece) return false;

    // Check for pawn promotion
    const isPawnPromotion =
      piece.type === 'p' &&
      ((piece.color === 'w' && targetSquare[1] === '8') ||
        (piece.color === 'b' && targetSquare[1] === '1'));

    if (isPawnPromotion) {
      setPendingPromotion({ from: sourceSquare as Square, to: targetSquare as Square });
      setShowPromotion(true);
      return true;
    }

    return executeMove(sourceSquare as Square, targetSquare as Square);
  };

  // Tap-to-move handler
  const handleSquareClick = ({ square }: { square: string }) => {
    const sq = square as Square;

    if (selectedSquare) {
      if (selectedSquare === sq) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      const moves = chessRef.current.moves({ square: selectedSquare, verbose: true });
      const targetMove = moves.find((m) => m.to === sq);

      if (targetMove) {
        const piece = chessRef.current.get(selectedSquare);
        const isPawnPromotion =
          piece &&
          piece.type === 'p' &&
          ((piece.color === 'w' && sq[1] === '8') || (piece.color === 'b' && sq[1] === '1'));

        if (isPawnPromotion) {
          setPendingPromotion({ from: selectedSquare, to: sq });
          setShowPromotion(true);
          return;
        }

        executeMove(selectedSquare, sq);
        return;
      }
    }

    // Select piece if it belongs to side to move
    const piece = chessRef.current.get(sq);
    if (piece && piece.color === chessRef.current.turn()) {
      setSelectedSquare(sq);
      const moves = chessRef.current.moves({ square: sq, verbose: true });
      setLegalMoves(moves.map((m) => m.to as Square));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  // Promotion choice
  const handlePromotionSelect = (piece: PieceSymbol) => {
    setShowPromotion(false);
    if (pendingPromotion) {
      executeMove(pendingPromotion.from, pendingPromotion.to, piece);
      setPendingPromotion(null);
    }
  };

  // Custom square styling
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    if (lastMove) {
      styles[lastMove.from] = { backgroundColor: 'rgba(224, 164, 58, 0.3)' };
      styles[lastMove.to] = { backgroundColor: 'rgba(224, 164, 58, 0.4)' };
    }

    if (hintHighlight) {
      styles[hintHighlight.from] = {
        backgroundColor: 'rgba(31, 111, 80, 0.35)',
        boxShadow: 'inset 0 0 0 3px #1F6F50',
      };
      styles[hintHighlight.to] = {
        backgroundColor: 'rgba(31, 111, 80, 0.45)',
        boxShadow: 'inset 0 0 0 3px #1F6F50',
      };
    }

    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: 'rgba(31, 111, 80, 0.4)',
        boxShadow: 'inset 0 0 0 3px #1F6F50',
      };
    }

    if (settings.showLegalMoves) {
      for (const sq of legalMoves) {
        const piece = chessRef.current.get(sq);
        styles[sq] = {
          background: piece
            ? 'radial-gradient(circle, rgba(31, 111, 80, 0.8) 20%, transparent 80%)'
            : 'radial-gradient(circle, rgba(31, 111, 80, 0.45) 24%, transparent 25%)',
          cursor: 'pointer',
        };
      }
    }

    if (chessRef.current.inCheck()) {
      const currentTurn = chessRef.current.turn();
      const board = chessRef.current.board();
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = board[r][c];
          if (p && p.type === 'k' && p.color === currentTurn) {
            const sq = `${String.fromCharCode(97 + c)}${8 - r}` as Square;
            styles[sq] = {
              backgroundColor: 'rgba(229, 57, 53, 0.55)',
              boxShadow: 'inset 0 0 10px rgba(229, 57, 53, 0.8)',
            };
          }
        }
      }
    }

    return styles;
  }, [legalMoves, selectedSquare, lastMove, hintHighlight, settings.showLegalMoves, fen]);

  const customArrows: Arrow[] = useMemo(() => {
    return hintArrow ? [hintArrow] : [];
  }, [hintArrow]);

  if (!isUnlocked) {
    return <SoloLockScreen onUnlockSuccess={() => setIsUnlocked(true)} />;
  }

  const boardThemeColors = BOARD_THEMES[settings.boardTheme] || BOARD_THEMES.classic;
  const isWhiteTurn = chessRef.current.turn() === 'w';

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      {/* Top Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-fg flex items-center gap-2">
              <span>♟️</span>
              <span>{bn.solo.title}</span>
            </h1>
            <Badge variant="accent" size="sm">
              <Sparkles className="w-3 h-3 mr-1" />
              <span>{bn.solo.modeBadge}</span>
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            {bn.solo.subtitle}
          </p>
        </div>

        {/* Engine brain level button, re-lock button, and turn indicator badge */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowBrainModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/40 bg-primary-soft text-primary font-medium text-xs hover:bg-primary-soft/80 active:scale-95 transition-all shadow-xs cursor-pointer touch-target"
            title="ইঞ্জিনের ব্রেন লেভেল পরিবর্তন করুন"
          >
            <span aria-hidden="true">🧠</span>
            <span className="font-semibold">{getEloBrainTitleBn(engineElo)}</span>
            <span className="text-[10px] bg-primary text-primary-fg px-1.5 py-0.5 rounded-md font-normal">
              {bn.solo.changeLevelBtn}
            </span>
          </button>

          <button
            type="button"
            onClick={handleLockSolo}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-2 text-muted hover:text-fg text-xs transition-colors cursor-pointer touch-target shadow-xs"
            title={bn.solo.lockButtonTitle}
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{bn.solo.lockButtonTitle}</span>
          </button>

          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-semibold text-xs shadow-xs transition-colors ${
              isWhiteTurn
                ? 'bg-surface text-fg border-primary'
                : 'bg-surface-2 text-fg border-accent'
            }`}
          >
            <span
              className={`w-3 h-3 rounded-full border ${
                isWhiteTurn ? 'bg-white border-black/40' : 'bg-black border-white/40'
              }`}
            />
            <span>{isWhiteTurn ? bn.solo.whiteTurn : bn.solo.blackTurn}</span>
          </div>

          {chessRef.current.inCheck() && (
            <Badge variant="blunder" size="sm" className="animate-pulse">
              {bn.solo.inCheck}
            </Badge>
          )}
        </div>
      </div>

      {/* Main Board & Sidebar Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Chessboard & Controls */}
        <div className="lg:col-span-7 flex flex-col items-center space-y-3">
          <div className="flex items-start gap-2.5 w-full justify-center">
            {/* Optional Side Evaluation Bar */}
            {showEvalBar && (
              <div className="hidden sm:block">
                <EvalBar
                  cp={currentEval.cp}
                  mate={currentEval.mate}
                  userColor={boardOrientation}
                />
              </div>
            )}

            {/* Chessboard Container */}
            <div
              className="w-full max-w-[460px] aspect-square rounded-xl overflow-hidden shadow-card border border-app select-none transition-colors"
              style={{ backgroundColor: boardThemeColors.light }}
            >
              <Chessboard
                key={`solo-board-${settings.boardTheme}-${boardOrientation}-${settings.showCoordinates}`}
                options={{
                  position: fen,
                  boardOrientation,
                  onPieceDrop: handlePieceDrop,
                  onSquareClick: handleSquareClick,
                  squareStyles: customSquareStyles,
                  arrows: customArrows,
                  darkSquareStyle: { backgroundColor: boardThemeColors.dark },
                  lightSquareStyle: { backgroundColor: boardThemeColors.light },
                  darkSquareNotationStyle: { color: boardThemeColors.light },
                  lightSquareNotationStyle: { color: boardThemeColors.dark },
                  showNotation: settings.showCoordinates,
                  animationDurationInMs: ANIMATION_SPEEDS[settings.animationSpeed] || 200,
                }}
              />
            </div>
          </div>

          {/* Controls Bar */}
          <div className="w-full max-w-[460px]">
            <SoloControls
              engineElo={engineElo}
              onOpenBrainModal={() => setShowBrainModal(true)}
              isHintLoading={isHintLoading}
              canUndo={moveHistory.length > 0}
              canRedo={currentMoveIndex < positionsHistoryRef.current.length - 1}
              showEvalBar={showEvalBar}
              autoFlip={autoFlip}
              onGetBestHint={handleGetBestHint}
              onUndo={handleUndoMove}
              onRedo={handleRedoMove}
              onFlipBoard={() =>
                setBoardOrientation((prev) => (prev === 'white' ? 'black' : 'white'))
              }
              onToggleAutoFlip={() => setAutoFlip((prev) => !prev)}
              onToggleEvalBar={() => setShowEvalBar((prev) => !prev)}
              onNewGame={() => setShowNewGameModal(true)}
              onCopyPgn={handleCopyPgn}
            />
          </div>
        </div>

        {/* Right: Hint Card & Move Log */}
        <div className="lg:col-span-5 space-y-4">
          {/* Best Hint Details Card */}
          {bestHint ? (
            <SoloHintCard
              hint={bestHint}
              onApplyHintMove={handleApplyHintMove}
              onClearHint={handleClearHint}
            />
          ) : (
            <Card variant="surface" className="p-4 text-xs text-muted border-dashed space-y-2">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <Sparkles className="w-4 h-4 text-accent" />
                <span>যেকোনো চালে সেরা ইঙ্গিত নিন</span>
              </div>
              <p className="leading-relaxed">
                উপরে <strong>"সেরা ইঙ্গিত নাও"</strong> বোতামে চাপ দিলে স্টকফিশ ইঞ্জিন বর্তমান পজিশনের সবচেয়ে মোক্ষম চাল খুঁজে বের করবে এবং বাংলা ব্যাখ্যাসহ বোর্ডে তীরচিহ্নে দেখাবে।
              </p>
            </Card>
          )}

          {/* Move History Table */}
          <SoloMoveHistory
            moves={moveHistory}
            currentMoveIndex={currentMoveIndex}
            onSelectMoveIndex={handleSelectMoveIndex}
          />
        </div>
      </div>

      {/* Promotion Modal */}
      <PromotionModal
        isOpen={showPromotion}
        color={isWhiteTurn ? 'white' : 'black'}
        onSelect={handlePromotionSelect}
        onCancel={() => setShowPromotion(false)}
      />

      {/* New Game Confirm Modal */}
      <Modal
        isOpen={showNewGameModal}
        onClose={() => setShowNewGameModal(false)}
        title={bn.solo.newGameConfirmTitle}
      >
        <div className="space-y-4 py-1">
          <p className="text-sm text-muted">{bn.solo.newGameConfirmDesc}</p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowNewGameModal(false)}
              className="px-4 py-2 text-sm rounded-lg hover:bg-surface-2 text-fg transition-colors"
            >
              {bn.ui.cancel}
            </button>
            <button
              onClick={handleResetGame}
              className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-fg hover:bg-primary/90 transition-colors font-medium"
            >
              {bn.solo.newGame}
            </button>
          </div>
        </div>
      </Modal>

      {/* Game Over Modal */}
      {gameOverInfo && (
        <Modal isOpen={Boolean(gameOverInfo)} onClose={() => setGameOverInfo(null)} title="">
          <div className="text-center py-3 space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary-soft text-primary rounded-2xl flex items-center justify-center text-3xl shadow-sm">
              <Trophy className="w-8 h-8 text-primary" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-fg">{gameOverInfo.title}</h3>
              <p className="text-xs sm:text-sm text-muted mt-1 max-w-sm mx-auto">
                {gameOverInfo.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <Button
                onClick={handleReviewThisGame}
                variant="primary"
                size="md"
                className="flex-1"
                leftIcon={<Award className="w-4 h-4" />}
              >
                {bn.solo.reviewGame}
              </Button>
              <Button
                onClick={handleResetGame}
                variant="secondary"
                size="md"
                className="flex-1"
                leftIcon={<RotateCw className="w-4 h-4" />}
              >
                {bn.solo.playAgain}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Engine ELO Brain Level Configuration Modal */}
      <SoloBrainModal
        isOpen={showBrainModal}
        currentElo={engineElo}
        onSelectElo={handleSelectElo}
        onClose={() => setShowBrainModal(false)}
      />

      {/* Toast alert */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};
