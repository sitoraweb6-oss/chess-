import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Chess, Square, PieceSymbol } from 'chess.js';
import { Chessboard, Arrow } from 'react-chessboard';
import { PlaySetup } from './PlaySetup.tsx';
import { CapturedBar } from './CapturedBar.tsx';
import { PlayControls } from './PlayControls.tsx';
import { PromotionModal } from './PromotionModal.tsx';
import { GameEndModal } from './GameEndModal.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { ErrorState } from '../../components/ui/ErrorState.tsx';
import { bn, toBanglaNumeral } from '../../i18n/bn.ts';
import {
  getStorageData,
  saveActiveGame,
  getActiveGame,
  clearActiveGame,
  saveCompletedGame,
  GameRecord,
} from '../../storage/index.ts';
import {
  getBotRating,
  getBotSkillLevel,
  getBotMoveTime,
  calculateElo,
  DEFAULT_BOT_LEVELS,
} from '../../domain/rating.ts';
import { getMaterialDifference } from '../../domain/captured.ts';
import { stockfishEngine } from '../../engine/index.ts';
import { playMoveSound, playCaptureSound, playCheckSound, playVictorySound } from '../../utils/sound.ts';

export const PlayScreen: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [botLevel, setBotLevel] = useState<number>(2);
  const [userColor, setUserColor] = useState<'white' | 'black'>('white');
  const [colorSelection, setColorSelection] = useState<'white' | 'black' | 'random'>('white');

  // Chess game state
  const chessRef = useRef<Chess>(new Chess());
  const [fen, setFen] = useState<string>(chessRef.current.fen());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [hintArrow, setHintArrow] = useState<Arrow | null>(null);

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

  const storageData = getStorageData();
  const settings = storageData.settings;

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
        setIsPlaying(true);
      } catch {
        clearActiveGame();
      }
    } else {
      const defaultLvl = DEFAULT_BOT_LEVELS[storageData.profile.level] || 2;
      setBotLevel(defaultLvl);
    }

    return () => {
      stockfishEngine.stop();
    };
  }, []);

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

  // Check material differences
  const material = useMemo(() => getMaterialDifference(fen), [fen]);

  // Persist game state helper
  const syncActiveGame = useCallback(() => {
    saveActiveGame({
      fen: chessRef.current.fen(),
      pgn: chessRef.current.pgn(),
      userColor,
      botLevel,
      hintsUsed: 3 - hintsLeft,
      undosUsed: 3 - undosLeft,
      history: chessRef.current.history(),
    });
  }, [userColor, botLevel, hintsLeft, undosLeft]);

  // End Game handler
  const handleGameEnd = useCallback(
    (result: 'win' | 'loss' | 'draw', reasonText: string) => {
      clearActiveGame();
      setIsPlaying(false);

      if (result === 'win') {
        playVictorySound(settings.sound);
      }

      const currentRating = getStorageData().rating;
      const bRating = getBotRating(botLevel);
      const { newRating, change } = calculateElo(currentRating, bRating, result);

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
        accuracy: 0, // Will be computed on review
        movesCount: chessRef.current.history().length,
      };

      saveCompletedGame(record, change, newRating);

      setGameEndData({
        result,
        reasonText,
        gameId,
        ratingChange: change,
        newRating,
      });
    },
    [botLevel, userColor, settings.sound]
  );

  // Check Game Over conditions
  const checkGameOver = useCallback((): boolean => {
    const chess = chessRef.current;
    if (chess.isCheckmate()) {
      const isUserTurn = (chess.turn() === 'w' && userColor === 'white') || (chess.turn() === 'b' && userColor === 'black');
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

  // Bot move logic
  const makeBotMove = useCallback(async () => {
    if (chessRef.current.isGameOver()) return;
    setIsBotThinking(true);
    setHintArrow(null);

    const startTime = Date.now();
    const currentFen = chessRef.current.fen();
    const skillLevel = getBotSkillLevel(botLevel);
    const moveTime = getBotMoveTime(botLevel);

    try {
      let chosenMoveUci = await stockfishEngine.getBestMove(currentFen, {
        skillLevel,
        movetime: moveTime,
      });

      // Beginners feature: levels 1-3 occasionally play a fun non-best legal move
      if (botLevel <= 3 && Math.random() < (botLevel === 1 ? 0.35 : botLevel === 2 ? 0.25 : 0.15)) {
        const legalList = chessRef.current.moves({ verbose: true });
        if (legalList.length > 1) {
          const randomIdx = Math.floor(Math.random() * legalList.length);
          const chosen = legalList[randomIdx];
          chosenMoveUci = `${chosen.from}${chosen.to}${chosen.promotion || ''}`;
        }
      }

      // Ensure at least 500ms delay so user perceives bot thinking
      const elapsed = Date.now() - startTime;
      if (elapsed < 500) {
        await new Promise((r) => setTimeout(r, 500 - elapsed));
      }

      if (chosenMoveUci && chosenMoveUci.length >= 4) {
        const from = chosenMoveUci.slice(0, 2) as Square;
        const to = chosenMoveUci.slice(2, 4) as Square;
        const promotion = (chosenMoveUci[4] as PieceSymbol) || undefined;

        const moveRes = chessRef.current.move({ from, to, promotion });
        if (moveRes) {
          if (moveRes.captured) {
            playCaptureSound(settings.sound);
          } else {
            playMoveSound(settings.sound);
          }
          if (chessRef.current.inCheck()) {
            playCheckSound(settings.sound);
          }

          setLastMove({ from, to });
          setFen(chessRef.current.fen());
          syncActiveGame();
          checkGameOver();
        }
      }
    } catch (err) {
      console.warn('Bot move error:', err);
    } finally {
      setIsBotThinking(false);
    }
  }, [botLevel, settings.sound, syncActiveGame, checkGameOver]);

  // Execute a player move
  const executePlayerMove = useCallback(
    (from: Square, to: Square, promotion?: PieceSymbol) => {
      try {
        const moveRes = chessRef.current.move({ from, to, promotion });
        if (!moveRes) return false;

        setSelectedSquare(null);
        setLegalMoves([]);
        setHintArrow(null);
        setLastMove({ from, to });
        setFen(chessRef.current.fen());

        if (moveRes.captured) {
          playCaptureSound(settings.sound);
        } else {
          playMoveSound(settings.sound);
        }
        if (chessRef.current.inCheck()) {
          playCheckSound(settings.sound);
        }

        syncActiveGame();

        const ended = checkGameOver();
        if (!ended) {
          setTimeout(makeBotMove, 150);
        }
        return true;
      } catch {
        return false;
      }
    },
    [settings.sound, syncActiveGame, checkGameOver, makeBotMove]
  );

  // Start new game
  const handleStartGame = () => {
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

      // Check if target is a legal move
      const moves = chessRef.current.moves({ square: selectedSquare, verbose: true });
      const matchingMove = moves.find((m) => m.to === sq);

      if (matchingMove) {
        if (matchingMove.promotion) {
          setPendingPromotion({ from: selectedSquare, to: sq });
          setShowPromotion(true);
        } else {
          executePlayerMove(selectedSquare, sq);
        }
        return;
      }
    }

    // Select piece if it belongs to user
    const piece = chessRef.current.get(sq);
    if (piece && ((piece.color === 'w' && userColor === 'white') || (piece.color === 'b' && userColor === 'black'))) {
      setSelectedSquare(sq);
      const moves = chessRef.current.moves({ square: sq, verbose: true });
      setLegalMoves(moves.map((m) => m.to as Square));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  // Handle Hint
  const handleHint = async () => {
    if (hintsLeft <= 0 || isBotThinking) return;
    try {
      const bestMoveUci = await stockfishEngine.getBestMove(chessRef.current.fen(), {
        movetime: 500,
      });
      if (bestMoveUci && bestMoveUci.length >= 4) {
        const from = bestMoveUci.slice(0, 2);
        const to = bestMoveUci.slice(2, 4);
        setHintArrow({
          startSquare: from,
          endSquare: to,
          color: '#E0A43A',
        });
        setHintsLeft((prev) => Math.max(0, prev - 1));
        syncActiveGame();
      }
    } catch (err) {
      console.warn('Hint error:', err);
    }
  };

  // Handle Undo
  const handleUndo = () => {
    if (undosLeft <= 0 || isBotThinking) return;
    const chess = chessRef.current;
    if (chess.history().length < 2) return;

    chess.undo(); // Undo bot move
    chess.undo(); // Undo user move

    setFen(chess.fen());
    setSelectedSquare(null);
    setLegalMoves([]);
    setHintArrow(null);
    setLastMove(null);
    setUndosLeft((prev) => Math.max(0, prev - 1));
    syncActiveGame();
  };

  // Square styling for legal moves, highlights, check
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    // Legal move dots
    if (settings.showLegalMoves) {
      legalMoves.forEach((sq) => {
        const targetPiece = chessRef.current.get(sq);
        styles[sq] = {
          background: targetPiece
            ? 'radial-gradient(circle, rgba(224, 164, 58, 0.7) 80%, transparent 80%)'
            : 'radial-gradient(circle, rgba(31, 111, 80, 0.45) 25%, transparent 26%)',
          borderRadius: '50%',
        };
      });
    }

    // Selected square
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: 'rgba(224, 164, 58, 0.4)',
      };
    }

    // Last move highlight
    if (lastMove) {
      styles[lastMove.from] = {
        backgroundColor: 'rgba(224, 164, 58, 0.25)',
      };
      styles[lastMove.to] = {
        backgroundColor: 'rgba(224, 164, 58, 0.35)',
      };
    }

    // Check highlight
    if (chessRef.current.inCheck()) {
      const turn = chessRef.current.turn();
      const board = chessRef.current.board();
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = board[r][c];
          if (p && p.type === 'k' && p.color === turn) {
            const sq = `${String.fromCharCode(97 + c)}${8 - r}`;
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
      <div className="w-full max-w-[480px] mx-auto aspect-square rounded-xl overflow-hidden shadow-card border border-[#1E2420]/15 select-none bg-[#EEEED2]">
        <Chessboard
          options={{
            position: fen,
            boardOrientation: userColor,
            onPieceDrop: handlePieceDrop,
            onSquareClick: handleSquareClick,
            squareStyles: customSquareStyles,
            arrows: customArrows,
            darkSquareStyle: { backgroundColor: '#769656' },
            lightSquareStyle: { backgroundColor: '#EEEED2' },
            animationDurationInMs: 200,
            showNotation: true,
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

      {/* Controls Bar */}
      <PlayControls
        hintsLeft={hintsLeft}
        undosLeft={undosLeft}
        isBotThinking={isBotThinking}
        isGameOver={chessRef.current.isGameOver()}
        onHint={handleHint}
        onUndo={handleUndo}
        onResign={() => setShowResignModal(true)}
        onNewGame={() => setShowNewGameModal(true)}
      />

      {/* Pawn Promotion Modal */}
      <PromotionModal
        isOpen={showPromotion}
        color={userColor}
        onSelect={(piece) => {
          setShowPromotion(false);
          if (pendingPromotion) {
            executePlayerMove(pendingPromotion.from, pendingPromotion.to, piece);
            setPendingPromotion(null);
          }
        }}
        onCancel={() => {
          setShowPromotion(false);
          setPendingPromotion(null);
        }}
      />

      {/* Resign Confirm Modal */}
      <Modal
        isOpen={showResignModal}
        onClose={() => setShowResignModal(false)}
        title={bn.play.modals.resignConfirmTitle}
        maxWidth="sm"
      >
        <div className="py-2 space-y-4">
          <p className="text-sm text-[#6B726D]">{bn.play.modals.resignConfirmText}</p>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setShowResignModal(false)}
              className="px-4 py-2 text-sm font-medium text-[#1E2420] hover:bg-[#F4EFE4] rounded-lg cursor-pointer touch-target"
            >
              {bn.play.modals.confirmCancel}
            </button>
            <button
              onClick={() => {
                setShowResignModal(false);
                handleGameEnd('loss', bn.play.gameEnd.resignation);
              }}
              className="px-4 py-2 text-sm font-semibold text-[#FFFDF8] bg-[#E53935] hover:bg-[#C62828] rounded-xl cursor-pointer touch-target"
            >
              {bn.play.modals.confirmYes}
            </button>
          </div>
        </div>
      </Modal>

      {/* New Game Confirm Modal */}
      <Modal
        isOpen={showNewGameModal}
        onClose={() => setShowNewGameModal(false)}
        title={bn.play.modals.newGameConfirmTitle}
        maxWidth="sm"
      >
        <div className="py-2 space-y-4">
          <p className="text-sm text-[#6B726D]">{bn.play.modals.newGameConfirmText}</p>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setShowNewGameModal(false)}
              className="px-4 py-2 text-sm font-medium text-[#1E2420] hover:bg-[#F4EFE4] rounded-lg cursor-pointer touch-target"
            >
              {bn.ui.cancel}
            </button>
            <button
              onClick={() => {
                setShowNewGameModal(false);
                clearActiveGame();
                setIsPlaying(false);
              }}
              className="px-4 py-2 text-sm font-semibold text-[#FFFDF8] bg-[#1F6F50] hover:bg-[#17573E] rounded-xl cursor-pointer touch-target"
            >
              {bn.play.modals.newGameYes}
            </button>
          </div>
        </div>
      </Modal>

      {/* Game End Modal */}
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
    </div>
  );
};
