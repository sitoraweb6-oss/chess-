import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Chess, Square, PieceSymbol } from 'chess.js';
import { Chessboard, Arrow } from 'react-chessboard';
import { PlaySetup } from './PlaySetup.tsx';
import { CapturedBar } from './CapturedBar.tsx';
import { PlayControls } from './PlayControls.tsx';
import { PromotionModal } from './PromotionModal.tsx';
import { GameEndModal } from './GameEndModal.tsx';
import { PlacementResultModal } from './PlacementResultModal.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { ErrorState } from '../../components/ui/ErrorState.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { bn, toBanglaNumeral } from '../../i18n/bn.ts';
import {
  getStorageData,
  saveActiveGame,
  getActiveGame,
  clearActiveGame,
  saveCompletedGame,
  updateStorageProfile,
  GameRecord,
} from '../../storage/index.ts';
import {
  getBotRating,
  getBotSkillLevel,
  getBotMoveTime,
  calculateElo,
  getKFactor,
  DEFAULT_BOT_LEVELS,
} from '../../domain/rating.ts';
import { getMaterialDifference } from '../../domain/captured.ts';
import { stockfishEngine, EvaluationResult } from '../../engine/index.ts';
import { backgroundEvaluator } from '../../engine/evaluator.ts';
import {
  getAdaptiveBotLevel,
  estimatePlacementRating,
  PlacementRatingResult,
} from '../../domain/placement.ts';
import { calculateWinPercent } from '../../domain/accuracy.ts';
import {
  playMoveSound,
  playCaptureSound,
  playCheckSound,
  playVictorySound,
} from '../../utils/sound.ts';
import {
  BOARD_THEMES,
  ANIMATION_SPEEDS,
  getCustomBoardStyles,
  getBoardTheme,
} from '../../utils/theme.ts';
import { useSettings } from '../../hooks/useSettings.ts';

export const PlayScreen: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isPlacementModeFromUrl = searchParams.get('mode') === 'placement';
  const customFenFromUrl = searchParams.get('fen');
  const isUnratedFromUrl = searchParams.get('unrated') === 'true' || Boolean(customFenFromUrl);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPlacementGame, setIsPlacementGame] = useState<boolean>(isPlacementModeFromUrl);
  const [isUnratedGame, setIsUnratedGame] = useState<boolean>(isUnratedFromUrl);
  const [botLevel, setBotLevel] = useState<number>(isPlacementModeFromUrl ? 4 : 2);
  const [userColor, setUserColor] = useState<'white' | 'black'>('white');
  const [colorSelection, setColorSelection] = useState<'white' | 'black' | 'random'>('white');

  // Chess game state
  const chessRef = useRef<Chess>(new Chess());
  const [fen, setFen] = useState<string>(chessRef.current.fen());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [hintArrow, setHintArrow] = useState<Arrow | null>(null);

  // Background position evaluations
  const [evaluationsByFen, setEvaluationsByFen] = useState<Record<string, EvaluationResult>>({});

  // Placement adaptation tracking
  const userMovesCountRef = useRef<number>(0);
  const lastWindowWinDropsRef = useRef<number[]>([]);

  // Bot & Controls
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [hintsLeft, setHintsLeft] = useState<number>(3);
  const [undosLeft, setUndosLeft] = useState<number>(3);
  const [engineError, setEngineError] = useState<string | null>(null);
  const [isRetryingEngine, setIsRetryingEngine] = useState<boolean>(false);

  // Modals
  const [showPromotion, setShowPromotion] = useState<boolean>(false);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [showResignModal, setShowResignModal] = useState<boolean>(false);
  const [showNewGameModal, setShowNewGameModal] = useState<boolean>(false);
  const [gameEndData, setGameEndData] = useState<{
    result: 'win' | 'loss' | 'draw';
    reasonText: string;
    gameId: string;
    ratingChange: number;
    newRating: number;
  } | null>(null);

  const [placementResultData, setPlacementResultData] = useState<PlacementRatingResult | null>(null);

  const { settings } = useSettings();
  const storageData = getStorageData();

  // Background evaluator listener
  useEffect(() => {
    backgroundEvaluator.setOnEvalComplete((evalFen, result) => {
      setEvaluationsByFen((prev) => ({
        ...prev,
        [evalFen]: result,
      }));
    });

    return () => {
      backgroundEvaluator.clear();
    };
  }, []);

  // Initialize engine and restore active game if present
  useEffect(() => {
    const init = async () => {
      try {
        setEngineError(null);
        await stockfishEngine.init();
      } catch (err) {
        console.error('Engine init failed:', err);
        setEngineError(bn.ui.engineError);
      }
    };
    init();

    // Check for custom FEN starting position (e.g. from puzzle "continue play")
    if (customFenFromUrl) {
      try {
        const customChess = new Chess(customFenFromUrl);
        chessRef.current = customChess;
        setFen(customChess.fen());
        const sideToMove = customChess.turn() === 'w' ? 'white' : 'black';
        setUserColor(sideToMove);
        setIsUnratedGame(true);
        setIsPlaying(true);
        setIsPlacementGame(false);
        const defaultLvl = DEFAULT_BOT_LEVELS[getStorageData().profile.level] || 3;
        setBotLevel(defaultLvl);
        clearActiveGame();
        return;
      } catch (err) {
        console.warn('Failed to parse custom FEN:', err);
      }
    }

    // Check for saved active game
    const active = getActiveGame();
    if (active) {
      try {
        const restoredChess = new Chess(active.fen);
        chessRef.current = restoredChess;
        setFen(restoredChess.fen());
        setUserColor(active.userColor);
        setBotLevel(active.botLevel);
        setHintsLeft(Math.max(0, 3 - active.hintsUsed));
        setUndosLeft(Math.max(0, 3 - active.undosUsed));
        setIsPlacementGame(Boolean(active.isPlacement));
        if (active.evaluationsByFen) {
          setEvaluationsByFen(active.evaluationsByFen);
        }
        setIsPlaying(true);
      } catch {
        clearActiveGame();
      }
    } else {
      if (isPlacementModeFromUrl) {
        setIsPlacementGame(true);
        setBotLevel(4);
      } else {
        const defaultLvl = DEFAULT_BOT_LEVELS[storageData.profile.level] || 2;
        setBotLevel(defaultLvl);
      }
    }
  }, [isPlacementModeFromUrl, customFenFromUrl, storageData.profile.level]);

  // Sync to localStorage
  const syncActiveGame = useCallback(() => {
    saveActiveGame({
      fen: chessRef.current.fen(),
      pgn: chessRef.current.pgn(),
      userColor,
      botLevel,
      hintsUsed: 3 - hintsLeft,
      undosUsed: 3 - undosLeft,
      history: chessRef.current.history(),
      evaluationsByFen,
      isPlacement: isPlacementGame,
    });
  }, [userColor, botLevel, hintsLeft, undosLeft, evaluationsByFen, isPlacementGame]);

  // Calculate material difference
  const material = useMemo(() => {
    return getMaterialDifference(fen);
  }, [fen]);

  // End Game handler
  const handleGameEnd = useCallback(
    (result: 'win' | 'loss' | 'draw', reasonText: string) => {
      clearActiveGame();
      setIsPlaying(false);
      backgroundEvaluator.clear();

      if (result === 'win') {
        playVictorySound(settings.sound);
      }

      const currentRating = getStorageData().rating;
      const bRating = getBotRating(botLevel);
      const completedGamesCount = storageData.games.length;
      const k = getKFactor(completedGamesCount);
      const { newRating, change } = calculateElo(currentRating, bRating, result, k);

      const gameId = `game-${Date.now()}`;
      const record: GameRecord = {
        id: gameId,
        pgn: chessRef.current.pgn(),
        fen: chessRef.current.fen(),
        userColor,
        botLevel,
        date: new Date().toISOString(),
        result,
        resultReason: reasonText,
        accuracy: 0,
        movesCount: chessRef.current.history().length,
        evaluationsByFen,
        isPlacement: isPlacementGame,
      };

      const finalChange = isUnratedGame ? 0 : change;
      const finalNewRating = isUnratedGame ? currentRating : newRating;

      saveCompletedGame(record, finalChange, finalNewRating);

      // If this was a placement game, compute estimated placement rating
      if (isPlacementGame) {
        const totalUserMoves = Math.max(1, userMovesCountRef.current);
        const avgWinDrop =
          lastWindowWinDropsRef.current.length > 0
            ? lastWindowWinDropsRef.current.reduce((a, b) => a + b, 0) /
              lastWindowWinDropsRef.current.length
            : 15;

        // Approximate accuracy from win drops: 100 - (avgDrop * 2.5)
        const approxAccuracy = Math.max(30, Math.min(95, Math.round(100 - avgWinDrop * 2.5)));
        const blunderCount = lastWindowWinDropsRef.current.filter((d) => d >= 20).length;
        const mistakeCount = lastWindowWinDropsRef.current.filter((d) => d >= 10 && d < 20).length;

        const placementResult = estimatePlacementRating({
          accuracy: approxAccuracy,
          blunderCount,
          mistakeCount,
          movesCount: chessRef.current.history().length,
          finalBotLevel: botLevel,
          result,
        });

        // Save estimated rating to profile
        updateStorageProfile('beginner', placementResult.estimatedRating, true);
        setPlacementResultData(placementResult);
      } else {
        setGameEndData({
          result,
          reasonText,
          gameId,
          ratingChange: change,
          newRating,
        });
      }
    },
    [botLevel, userColor, settings.sound, storageData.games.length, evaluationsByFen, isPlacementGame]
  );

  // Check Game Over conditions
  const checkGameOver = useCallback((): boolean => {
    const chess = chessRef.current;
    if (chess.isCheckmate()) {
      const isUserTurn =
        (chess.turn() === 'w' && userColor === 'white') ||
        (chess.turn() === 'b' && userColor === 'black');
      if (isUserTurn) {
        handleGameEnd('loss', bn.play.gameEnd.checkmateLoss);
      } else {
        handleGameEnd('win', bn.play.gameEnd.checkmateWin);
      }
      return true;
    }
    if (chess.isStalemate()) {
      handleGameEnd('draw', bn.play.gameEnd.stalemate);
      return true;
    }
    if (chess.isThreefoldRepetition()) {
      handleGameEnd('draw', bn.play.gameEnd.threefold);
      return true;
    }
    if (chess.isInsufficientMaterial()) {
      handleGameEnd('draw', bn.play.gameEnd.insufficient);
      return true;
    }
    if (chess.isDrawByFiftyMoves()) {
      handleGameEnd('draw', bn.play.gameEnd.fiftyMoves);
      return true;
    }
    return false;
  }, [userColor, handleGameEnd]);

  // Bot move logic: ALWAYS prioritizes bot move over background evaluations
  const makeBotMove = useCallback(async () => {
    if (chessRef.current.isGameOver()) return;

    // Immediately pause any ongoing background evaluation
    backgroundEvaluator.pause();
    setIsBotThinking(true);
    setHintArrow(null);

    const startTime = Date.now();
    const currentFen = chessRef.current.fen();
    const skillLevel = getBotSkillLevel(botLevel);
    const moveTime = getBotMoveTime(botLevel);

    try {
      let chosenMoveUci = await stockfishEngine
        .getBestMove(currentFen, {
          skillLevel,
          movetime: moveTime,
        })
        .catch((err) => {
          console.warn('[PlayScreen] stockfishEngine.getBestMove failed, will use fallback:', err);
          return '';
        });

      // Beginners feature: levels 1-3 occasionally play a non-best legal move
      if (
        chosenMoveUci &&
        botLevel <= 3 &&
        Math.random() < (botLevel === 1 ? 0.35 : botLevel === 2 ? 0.25 : 0.15)
      ) {
        const legalList = chessRef.current.moves({ verbose: true });
        if (legalList.length > 1) {
          const randomIdx = Math.floor(Math.random() * legalList.length);
          const chosen = legalList[randomIdx];
          chosenMoveUci = `${chosen.from}${chosen.to}${chosen.promotion || ''}`;
        }
      }

      // Ensure at least 400ms delay so user perceives bot thinking
      const elapsed = Date.now() - startTime;
      if (elapsed < 400) {
        await new Promise((r) => setTimeout(r, 400 - elapsed));
      }

      let moveRes: ReturnType<Chess['move']> | null = null;
      let finalFrom: Square | null = null;
      let finalTo: Square | null = null;

      if (chosenMoveUci && chosenMoveUci.length >= 4) {
        const from = chosenMoveUci.slice(0, 2) as Square;
        const to = chosenMoveUci.slice(2, 4) as Square;
        const promotion = (chosenMoveUci[4] as PieceSymbol) || undefined;
        try {
          moveRes = chessRef.current.move({ from, to, promotion });
          if (moveRes) {
            finalFrom = from;
            finalTo = to;
          }
        } catch {
          moveRes = null;
        }
      }

      // Fallback: pick any legal move if engine move failed
      if (!moveRes) {
        const legalList = chessRef.current.moves({ verbose: true });
        if (legalList.length > 0) {
          const randomMove = legalList[Math.floor(Math.random() * legalList.length)];
          moveRes = chessRef.current.move({
            from: randomMove.from,
            to: randomMove.to,
            promotion: randomMove.promotion,
          });
          finalFrom = randomMove.from;
          finalTo = randomMove.to;
        }
      }

      if (moveRes && finalFrom && finalTo) {
        const newFen = chessRef.current.fen();
        setFen(newFen);
        setLastMove({ from: finalFrom, to: finalTo });

        if (moveRes.captured) {
          playCaptureSound(settings.sound);
        } else {
          playMoveSound(settings.sound);
        }
        if (chessRef.current.inCheck()) {
          playCheckSound(settings.sound);
        }

        syncActiveGame();

        // Enqueue new position for background evaluation while user thinks
        backgroundEvaluator.enqueue(newFen);
        // Resume background worker
        backgroundEvaluator.resume();

        checkGameOver();
      }
    } catch (err) {
      console.error('[PlayScreen] Critical error in makeBotMove:', err);
    } finally {
      setIsBotThinking(false);
    }
  }, [botLevel, settings.sound, syncActiveGame, checkGameOver]);

  // Execute Player Move
  const executePlayerMove = useCallback(
    (from: Square, to: Square, promotionPiece?: PieceSymbol): boolean => {
      if (isBotThinking) return false;

      const fenBefore = chessRef.current.fen();

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

        if (moveRes.captured) {
          playCaptureSound(settings.sound);
        } else {
          playMoveSound(settings.sound);
        }
        if (chessRef.current.inCheck()) {
          playCheckSound(settings.sound);
        }

        // Placement mode adaptation check
        if (isPlacementGame) {
          userMovesCountRef.current++;

          // Rough win drop estimation from material and balance
          const evalB = evaluationsByFen[fenBefore];
          const evalA = evaluationsByFen[newFen];
          let drop = 5;
          if (evalB && evalA) {
            const wBefore = calculateWinPercent(evalB.cp, evalB.mate);
            const wAfter = calculateWinPercent(evalA.cp, evalA.mate);
            drop = Math.max(0, wBefore - (100 - wAfter));
          } else if (moveRes.captured) {
            drop = 0;
          }
          lastWindowWinDropsRef.current.push(drop);

          // Every 5 user moves, adapt bot level
          if (userMovesCountRef.current % 5 === 0) {
            const last5 = lastWindowWinDropsRef.current.slice(-5);
            const avgDrop = last5.reduce((a, b) => a + b, 0) / last5.length;
            const adapted = getAdaptiveBotLevel(botLevel, avgDrop);
            if (adapted !== botLevel) {
              setBotLevel(adapted);
            }
          }
        }

        syncActiveGame();

        // Enqueue position for evaluation
        backgroundEvaluator.enqueue(newFen);

        const ended = checkGameOver();
        if (!ended) {
          setTimeout(makeBotMove, 150);
        }
        return true;
      } catch {
        return false;
      }
    },
    [isBotThinking, settings.sound, isPlacementGame, evaluationsByFen, botLevel, syncActiveGame, checkGameOver, makeBotMove]
  );

  // Start new game
  const handleStartGame = () => {
    stockfishEngine.newGame().catch((e) => console.warn('[PlayScreen] newGame error on start:', e));

    const finalColor =
      colorSelection === 'random'
        ? Math.random() < 0.5
          ? 'white'
          : 'black'
        : colorSelection;

    const newChess = new Chess();
    chessRef.current = newChess;
    setUserColor(finalColor);
    setFen(newChess.fen());
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setHintArrow(null);
    setHintsLeft(3);
    setUndosLeft(3);
    setIsPlaying(true);
    setGameEndData(null);
    setPlacementResultData(null);
    setEvaluationsByFen({});
    userMovesCountRef.current = 0;
    lastWindowWinDropsRef.current = [];

    // Enqueue initial position
    backgroundEvaluator.clear();
    backgroundEvaluator.enqueue(newChess.fen());

    syncActiveGame();

    // If bot is white, bot makes first move
    if (finalColor === 'black') {
      setTimeout(makeBotMove, 400);
    }
  };

  // Drag and drop piece handler
  const handlePieceDrop = ({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string;
    targetSquare: string | null;
  }): boolean => {
    if (!targetSquare || isBotThinking) return false;

    const currentTurn = chessRef.current.turn();
    const isUserTurn =
      (currentTurn === 'w' && userColor === 'white') ||
      (currentTurn === 'b' && userColor === 'black');
    if (!isUserTurn) return false;

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

    return executePlayerMove(sourceSquare as Square, targetSquare as Square);
  };

  // Square click handler (tap to move support)
  const handleSquareClick = ({ square }: { square: string }) => {
    if (isBotThinking) return;

    const sq = square as Square;
    const currentTurn = chessRef.current.turn();
    const isUserTurn =
      (currentTurn === 'w' && userColor === 'white') ||
      (currentTurn === 'b' && userColor === 'black');

    if (!isUserTurn) return;

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

        executePlayerMove(selectedSquare, sq);
        return;
      }
    }

    // Select piece if it's the user's turn and color
    const piece = chessRef.current.get(sq);
    if (
      piece &&
      ((piece.color === 'w' && userColor === 'white') ||
        (piece.color === 'b' && userColor === 'black'))
    ) {
      setSelectedSquare(sq);
      const moves = chessRef.current.moves({ square: sq, verbose: true });
      setLegalMoves(moves.map((m) => m.to));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  // Promotion choice handler
  const handlePromotionSelect = (piece: PieceSymbol) => {
    setShowPromotion(false);
    if (pendingPromotion) {
      executePlayerMove(pendingPromotion.from, pendingPromotion.to, piece);
      setPendingPromotion(null);
    }
  };

  // Hint handler
  const handleRequestHint = async () => {
    if (hintsLeft <= 0 || isBotThinking) return;
    try {
      const bestMoveUci = await stockfishEngine.getBestMove(chessRef.current.fen(), {
        skillLevel: 20,
        movetime: 400,
      });
      if (bestMoveUci && bestMoveUci.length >= 4) {
        const from = bestMoveUci.slice(0, 2) as Square;
        const to = bestMoveUci.slice(2, 4) as Square;
        setHintArrow({
          startSquare: from,
          endSquare: to,
          color: 'rgba(224, 164, 58, 0.85)',
        });
        setHintsLeft((prev) => prev - 1);
        syncActiveGame();
      }
    } catch (err) {
      console.warn('Hint generation failed:', err);
    }
  };

  // Undo move handler
  const handleUndoMove = () => {
    if (undosLeft <= 0 || isBotThinking) return;

    const hist = chessRef.current.history({ verbose: true });
    if (hist.length === 0) return;

    chessRef.current.undo();
    if (chessRef.current.turn() !== (userColor === 'white' ? 'w' : 'b') && hist.length > 1) {
      chessRef.current.undo();
    }

    setFen(chessRef.current.fen());
    setSelectedSquare(null);
    setLegalMoves([]);
    setHintArrow(null);
    setLastMove(null);
    setUndosLeft((prev) => prev - 1);
    syncActiveGame();
  };

  // Resign handler
  const handleResign = () => {
    setShowResignModal(false);
    handleGameEnd('loss', bn.play.gameEnd.resignation);
  };

  // Retry engine init
  const handleRetryEngine = async () => {
    setIsRetryingEngine(true);
    try {
      await stockfishEngine.init({ force: true });
      setEngineError(null);
    } catch {
      setEngineError(bn.ui.engineError);
    } finally {
      setIsRetryingEngine(false);
    }
  };

  // Custom square styling
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    if (lastMove) {
      styles[lastMove.from] = {
        backgroundColor: 'rgba(224, 164, 58, 0.35)',
      };
      styles[lastMove.to] = {
        backgroundColor: 'rgba(224, 164, 58, 0.45)',
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
        if (piece) {
          styles[sq] = {
            boxShadow: 'inset 0 0 0 4px rgba(31, 111, 80, 0.8)',
            cursor: 'pointer',
          };
        } else {
          styles[sq] = {
            background: 'radial-gradient(circle, rgba(31, 111, 80, 0.45) 24%, transparent 25%)',
            cursor: 'pointer',
          };
        }
      }
    }

    if (chessRef.current.inCheck()) {
      const currentTurn = chessRef.current.turn();
      const board = chessRef.current.board();
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = board[r][c];
          if (piece && piece.type === 'k' && piece.color === currentTurn) {
            const file = String.fromCharCode(97 + c);
            const rank = String(8 - r);
            const sq = `${file}${rank}` as Square;
            styles[sq] = {
              backgroundColor: 'rgba(229, 57, 53, 0.55)',
              boxShadow: 'inset 0 0 10px rgba(229, 57, 53, 0.8)',
            };
          }
        }
      }
    }

    return styles;
  }, [legalMoves, selectedSquare, lastMove, settings.showLegalMoves, fen]);

  const customArrows: Arrow[] = useMemo(() => {
    return hintArrow ? [hintArrow] : [];
  }, [hintArrow]);

  const boardThemeColors = BOARD_THEMES[settings.boardTheme] || BOARD_THEMES.classic;

  if (engineError) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        <ErrorState
          title={bn.ui.engineError}
          message="স্টকফিশ ইঞ্জিন লোড করতে সমস্যা হয়েছে। ইন্টারনেট সংযোগ যাচাই করে পুনরায় চেষ্টা করুন।"
          technicalDetails={stockfishEngine.getLastError()}
          onRetry={handleRetryEngine}
          isRetrying={isRetryingEngine}
        />
      </div>
    );
  }

  if (!isPlaying) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isPlacementGame && (
          <div className="mb-4 p-4 rounded-xl bg-[#E6F2EC] dark:bg-[#1F6F50]/20 border border-[#1F6F50]/30 text-center">
            <Badge variant="primary" className="mb-1">
              {bn.play.placementModeTitle}
            </Badge>
            <p className="text-xs text-[#1F6F50] dark:text-[#E6F2EC] font-medium">
              {bn.play.placementModeSubtitle}
            </p>
          </div>
        )}

        <PlaySetup
          botLevel={botLevel}
          onBotLevelChange={setBotLevel}
          color={colorSelection}
          onColorChange={setColorSelection}
          onStartGame={handleStartGame}
        />

        {gameEndData && (
          <GameEndModal
            isOpen={Boolean(gameEndData)}
            result={gameEndData.result}
            reasonText={gameEndData.reasonText}
            gameId={gameEndData.gameId}
            ratingChange={gameEndData.ratingChange}
            newRating={gameEndData.newRating}
            onPlayAgain={handleStartGame}
          />
        )}

        {placementResultData && (
          <PlacementResultModal
            isOpen={Boolean(placementResultData)}
            resultData={placementResultData}
            onContinue={() => navigate('/')}
          />
        )}
      </div>
    );
  }

  const isUserTurn =
    (chessRef.current.turn() === 'w' && userColor === 'white') ||
    (chessRef.current.turn() === 'b' && userColor === 'black');

  const topColor = userColor === 'white' ? 'black' : 'white';
  const bottomColor = userColor;

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-6 py-4 space-y-3">
      {/* Top Banner if Placement Mode */}
      {isPlacementGame && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#E6F2EC] dark:bg-[#1F6F50]/20 text-xs text-[#1F6F50] dark:text-[#E6F2EC]">
          <span className="font-semibold flex items-center gap-1.5">
            🎯 <span>{bn.play.placementModeTitle}</span>
          </span>
          <span className="text-[11px] opacity-80">বট স্তর মানিয়ে নিচ্ছে</span>
        </div>
      )}

      {/* Top Player (Bot) Bar */}
      <CapturedBar
        color={topColor}
        playerName={`বট (লেভেল ${toBanglaNumeral(botLevel)})`}
        isTurn={!isUserTurn}
        capturedPieces={topColor === 'white' ? material.capturedByWhite : material.capturedByBlack}
        advantage={topColor === 'white' ? material.difference : -material.difference}
        isThinking={isBotThinking}
      />

      {/* Chessboard Container */}
      <div
        className="w-full max-w-[480px] mx-auto aspect-square rounded-xl overflow-hidden shadow-card border border-app select-none transition-colors"
        style={{ backgroundColor: boardThemeColors.light }}
      >
        <Chessboard
          key={`play-board-${settings.boardTheme}-${settings.showCoordinates}-${settings.animationSpeed}`}
          options={{
            position: fen,
            boardOrientation: userColor,
            onPieceDrop: handlePieceDrop,
            onSquareClick: handleSquareClick,
            squareStyles: customSquareStyles,
            arrows: customArrows,
            darkSquareStyle: { backgroundColor: boardThemeColors.dark },
            lightSquareStyle: { backgroundColor: boardThemeColors.light },
            darkSquareNotationStyle: { color: boardThemeColors.light },
            lightSquareNotationStyle: { color: boardThemeColors.dark },
            animationDurationInMs: ANIMATION_SPEEDS[settings.animationSpeed] || 200,
            showNotation: settings.showCoordinates,
          }}
        />
      </div>

      {/* Bottom Player (User) Bar */}
      <CapturedBar
        color={bottomColor}
        playerName="আপনি"
        isTurn={isUserTurn}
        capturedPieces={bottomColor === 'white' ? material.capturedByWhite : material.capturedByBlack}
        advantage={bottomColor === 'white' ? material.difference : -material.difference}
      />

      {/* Control Buttons */}
      <PlayControls
        isUserTurn={isUserTurn}
        hintsLeft={hintsLeft}
        undosLeft={undosLeft}
        onHint={handleRequestHint}
        onUndo={handleUndoMove}
        onResign={() => setShowResignModal(true)}
        onNewGame={() => setShowNewGameModal(true)}
      />

      {/* Promotion Modal */}
      <PromotionModal
        isOpen={showPromotion}
        color={userColor}
        onSelect={handlePromotionSelect}
        onCancel={() => setShowPromotion(false)}
      />


      {/* Resign Modal */}
      <Modal
        isOpen={showResignModal}
        onClose={() => setShowResignModal(false)}
        title={bn.play.resignConfirmTitle}
      >
        <div className="space-y-4">
          <p className="text-sm text-[#6B726D]">{bn.play.resignConfirmDesc}</p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowResignModal(false)}
              className="px-4 py-2 text-sm rounded-lg hover:bg-[#1E2420]/10 transition-colors"
            >
              {bn.play.resignNo}
            </button>
            <button
              onClick={handleResign}
              className="px-4 py-2 text-sm rounded-lg bg-[#E53935] text-white hover:bg-[#D32F2F] transition-colors"
            >
              {bn.play.resignYes}
            </button>
          </div>
        </div>
      </Modal>

      {/* New Game Confirm Modal */}
      <Modal
        isOpen={showNewGameModal}
        onClose={() => setShowNewGameModal(false)}
        title={bn.play.newGameConfirmTitle}
      >
        <div className="space-y-4">
          <p className="text-sm text-[#6B726D]">{bn.play.newGameConfirmDesc}</p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowNewGameModal(false)}
              className="px-4 py-2 text-sm rounded-lg hover:bg-[#1E2420]/10 transition-colors"
            >
              {bn.play.newGameNo}
            </button>
            <button
              onClick={() => {
                setShowNewGameModal(false);
                clearActiveGame();
                setIsPlaying(false);
              }}
              className="px-4 py-2 text-sm rounded-lg bg-[#1F6F50] text-white hover:bg-[#17573E] transition-colors"
            >
              {bn.play.newGameYes}
            </button>
          </div>
        </div>
      </Modal>

      {/* Placement Result Modal */}
      {placementResultData && (
        <PlacementResultModal
          isOpen={Boolean(placementResultData)}
          resultData={placementResultData}
          onContinue={() => navigate('/')}
        />
      )}
    </div>
  );
};
