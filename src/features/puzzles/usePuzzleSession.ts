import { useState, useEffect, useRef, useCallback } from 'react';
import { Chess, Square, PieceSymbol } from 'chess.js';
import { Arrow } from 'react-chessboard';
import { PersonalPuzzle } from '../../domain/puzzles.ts';
import { stockfishEngine } from '../../engine/index.ts';
import { evaluateFenSafe } from '../../engine/evaluator.ts';
import { calculateWinPercent } from '../../domain/accuracy.ts';
import { updatePersonalPuzzle } from '../../storage/index.ts';
import {
  playMoveSound,
  playCaptureSound,
  playCheckSound,
  playVictorySound,
} from '../../utils/sound.ts';

export type SessionState =
  | 'userTurn'
  | 'checking'
  | 'opponentTurn'
  | 'solved'
  | 'failed'
  | 'continuePlay';

export type StatusType = 'neutral' | 'success' | 'warning' | 'error';

export interface UsePuzzleSessionResult {
  chess: Chess;
  fen: string;
  sessionState: SessionState;
  userStepCount: number; // 0, 1, 2, 3...
  attemptsOnCurrentMove: number;
  statusMessage: string | null;
  statusType: StatusType;
  hintSquare: Square | null;
  answerArrow: Arrow | null;
  lastUserMove: { from: Square; to: Square } | null;
  lastOpponentMove: { from: Square; to: Square } | null;
  errorText: string | null;
  userColor: 'white' | 'black';
  turnColor: 'white' | 'black';
  handleUserMove: (from: Square, to: Square, promotion?: PieceSymbol) => boolean;
  loadPuzzle: (p: PersonalPuzzle) => void;
}

function getPieceNameBn(pieceType?: string): string {
  switch (pieceType) {
    case 'p':
      return 'সৈন্য';
    case 'n':
      return 'ঘোড়া';
    case 'b':
      return 'হাতি';
    case 'r':
      return 'নৌকা';
    case 'q':
      return 'মন্ত্রী';
    case 'k':
      return 'রাজা';
    default:
      return 'ঘুঁটি';
  }
}

function formatUciMoveToBangla(uci: string, fen: string): string {
  if (!uci || uci.length < 4) return uci || '';
  try {
    const c = new Chess(fen);
    const m = c.move({
      from: uci.slice(0, 2) as Square,
      to: uci.slice(2, 4) as Square,
      promotion: (uci[4] as PieceSymbol) || 'q',
    });
    return m ? m.san : uci;
  } catch {
    return uci;
  }
}

export function usePuzzleSession(
  puzzle: PersonalPuzzle | undefined,
  soundEnabled: boolean
): UsePuzzleSessionResult {
  const chessRef = useRef<Chess>(new Chess());
  const fenBeforeStepRef = useRef<string>('');

  const [fen, setFen] = useState<string>('');
  const [sessionState, setSessionState] = useState<SessionState>('userTurn');
  const [userStepCount, setUserStepCount] = useState<number>(0);
  const [attemptsOnCurrentMove, setAttemptsOnCurrentMove] = useState<number>(0);

  const [statusMessage, setStatusMessage] = useState<string | null>('তোমার চাল');
  const [statusType, setStatusType] = useState<StatusType>('neutral');
  const [hintSquare, setHintSquare] = useState<Square | null>(null);
  const [answerArrow, setAnswerArrow] = useState<Arrow | null>(null);

  const [lastUserMove, setLastUserMove] = useState<{ from: Square; to: Square } | null>(null);
  const [lastOpponentMove, setLastOpponentMove] = useState<{ from: Square; to: Square } | null>(
    null
  );
  const [errorText, setErrorText] = useState<string | null>(null);

  // Initialize/load puzzle position
  const loadPuzzle = useCallback((p: PersonalPuzzle) => {
    try {
      const c = new Chess(p.fenBefore);
      chessRef.current = c;
      fenBeforeStepRef.current = c.fen();

      setFen(c.fen());
      setSessionState('userTurn');
      setUserStepCount(0);
      setAttemptsOnCurrentMove(0);
      setStatusMessage('তোমার চাল');
      setStatusType('neutral');
      setHintSquare(null);
      setAnswerArrow(null);
      setLastUserMove(null);
      setLastOpponentMove(null);
      setErrorText(null);
    } catch (err) {
      console.warn('Failed to load puzzle position:', err);
    }
  }, []);

  useEffect(() => {
    if (puzzle) {
      loadPuzzle(puzzle);
    }
  }, [puzzle, loadPuzzle]);

  const userColor: 'white' | 'black' = puzzle
    ? new Chess(puzzle.fenBefore).turn() === 'w'
      ? 'white'
      : 'black'
    : 'white';

  const turnColor: 'white' | 'black' = chessRef.current.turn() === 'w' ? 'white' : 'black';

  // Async opponent reply
  const makeOpponentReplyAsync = useCallback(
    async (currentStepCount: number) => {
      if (!puzzle) return;

      // Check terminal position before engine
      if (chessRef.current.isGameOver()) {
        setSessionState('solved');
        setStatusMessage('সমাধান হয়েছে! ✨');
        setStatusType('success');
        updatePersonalPuzzle(puzzle.id, true);
        playVictorySound(soundEnabled);
        return;
      }

      try {
        await stockfishEngine.init();
        const bestMoveResult = await stockfishEngine.getBestMove(chessRef.current.fen(), {
          movetime: 500,
          skillLevel: 20,
        });

        if (bestMoveResult && bestMoveResult.length >= 4) {
          const oppFrom = bestMoveResult.slice(0, 2) as Square;
          const oppTo = bestMoveResult.slice(2, 4) as Square;
          const oppPromo = (bestMoveResult[4] as PieceSymbol) || undefined;

          const oppMoveRes = chessRef.current.move({
            from: oppFrom,
            to: oppTo,
            promotion: oppPromo,
          });

          if (oppMoveRes) {
            const newFen = chessRef.current.fen();
            setFen(newFen);
            setLastOpponentMove({ from: oppFrom, to: oppTo });
            fenBeforeStepRef.current = newFen; // Set starting FEN for next user move

            if (oppMoveRes.captured) playCaptureSound(soundEnabled);
            else playMoveSound(soundEnabled);
            if (chessRef.current.inCheck()) playCheckSound(soundEnabled);

            if (chessRef.current.isGameOver()) {
              setSessionState('solved');
              setStatusMessage('সমাধান হয়েছে! ✨');
              setStatusType('success');
              updatePersonalPuzzle(puzzle.id, true);
              playVictorySound(soundEnabled);
              return;
            }

            // Check if user advantage is decisive after opponent's reply
            const evalAfterOpp = await evaluateFenSafe(newFen, { movetime: 300 });
            // In newFen, turn is user, so user win% is direct
            const userWinCurrent = calculateWinPercent(evalAfterOpp.cp, evalAfterOpp.mate);

            if (userWinCurrent >= 85 || currentStepCount >= 3) {
              setSessionState('solved');
              setStatusMessage('সমাধান হয়েছে! ✨');
              setStatusType('success');
              updatePersonalPuzzle(puzzle.id, true);
              playVictorySound(soundEnabled);
            } else {
              setSessionState('userTurn');
              setStatusMessage('তোমার চাল');
              setStatusType('neutral');
            }
          } else {
            setSessionState('userTurn');
            setStatusMessage('তোমার চাল');
          }
        } else {
          setSessionState('userTurn');
          setStatusMessage('তোমার চাল');
        }
      } catch (err) {
        console.error('Opponent reply error:', err);
        setErrorText('ইঞ্জিন সাড়া দেয়নি। তোমার চাল চালিয়ে যাও।');
        setSessionState('userTurn');
        setStatusMessage('তোমার চাল');
      }
    },
    [puzzle, soundEnabled]
  );

  // Async user move check
  const checkUserMoveAsync = useCallback(
    async (
      from: Square,
      to: Square,
      promotion: PieceSymbol | undefined,
      positionAfterMoveFen: string
    ) => {
      if (!puzzle) return;

      const fenBeforeMove = fenBeforeStepRef.current;
      const userMoveUci = `${from}${to}${promotion || ''}`;

      // 1. Checkmate or draw delivered directly
      if (chessRef.current.isCheckmate()) {
        const newStep = userStepCount + 1;
        setUserStepCount(newStep);
        setSessionState('solved');
        setStatusMessage('সমাধান হয়েছে! ✨ (সরাসরি চেকমেট)');
        setStatusType('success');
        updatePersonalPuzzle(puzzle.id, true);
        playVictorySound(soundEnabled);
        return;
      }

      if (chessRef.current.isDraw() || chessRef.current.isStalemate()) {
        setSessionState('solved');
        setStatusMessage('সমাধান হয়েছে! ✨');
        setStatusType('success');
        updatePersonalPuzzle(puzzle.id, true);
        playVictorySound(soundEnabled);
        return;
      }

      try {
        // 2. Evaluate fenBeforeMove with Stockfish to get engine best move and optimal win%
        const evalBefore = await evaluateFenSafe(fenBeforeMove, { movetime: 500 });
        const engineBestUci = evalBefore.bestMove;

        let isCorrect = false;

        // Exact UCI match
        if (
          userMoveUci === engineBestUci ||
          userMoveUci === puzzle.bestMoveUci ||
          (userStepCount === 0 && userMoveUci === puzzle.bestMoveUci)
        ) {
          isCorrect = true;
        } else {
          // Compare win% after user move with win% after engine best move
          const evalAfterUser = await evaluateFenSafe(positionAfterMoveFen, { movetime: 500 });
          const userWinAfter = 100 - calculateWinPercent(evalAfterUser.cp, evalAfterUser.mate);

          let userWinBest = 100;
          if (engineBestUci && engineBestUci.length >= 4) {
            const tempChess = new Chess(fenBeforeMove);
            try {
              tempChess.move({
                from: engineBestUci.slice(0, 2) as Square,
                to: engineBestUci.slice(2, 4) as Square,
                promotion: (engineBestUci[4] as PieceSymbol) || 'q',
              });
              const evalAfterBest = await evaluateFenSafe(tempChess.fen(), { movetime: 500 });
              userWinBest = 100 - calculateWinPercent(evalAfterBest.cp, evalAfterBest.mate);
            } catch {
              userWinBest = calculateWinPercent(evalBefore.cp, evalBefore.mate);
            }
          } else {
            userWinBest = calculateWinPercent(evalBefore.cp, evalBefore.mate);
          }

          // Accepted if within 5 win% points of the best move
          if (userWinAfter >= userWinBest - 5) {
            isCorrect = true;
          }
        }

        if (isCorrect) {
          // Correct move
          const newStep = userStepCount + 1;
          setUserStepCount(newStep);
          setAttemptsOnCurrentMove(0);
          setAnswerArrow(null);
          setHintSquare(null);

          const evalAfterUser = await evaluateFenSafe(positionAfterMoveFen, { movetime: 300 });
          const userWinAfter = 100 - calculateWinPercent(evalAfterUser.cp, evalAfterUser.mate);

          if (newStep >= 3 || userWinAfter >= 85) {
            // Solved
            setSessionState('solved');
            setStatusMessage('সমাধান হয়েছে! ✨');
            setStatusType('success');
            updatePersonalPuzzle(puzzle.id, true);
            playVictorySound(soundEnabled);
          } else {
            // Opponent's turn
            setSessionState('opponentTurn');
            setStatusMessage('প্রতিপক্ষ ভাবছে...');
            setStatusType('neutral');
            setTimeout(() => {
              makeOpponentReplyAsync(newStep);
            }, 600);
          }
        } else {
          // Wrong move
          chessRef.current.undo();
          setFen(chessRef.current.fen());

          const nextAttempts = attemptsOnCurrentMove + 1;
          setAttemptsOnCurrentMove(nextAttempts);

          const targetBestUci = engineBestUci || puzzle.bestMoveUci;
          const fromSq = targetBestUci.slice(0, 2) as Square;
          const toSq = targetBestUci.slice(2, 4) as Square;

          if (nextAttempts === 1) {
            // First miss: gentle hint
            const piece = chessRef.current.get(fromSq);
            const pieceName = getPieceNameBn(piece?.type);
            setHintSquare(fromSq);
            setStatusMessage(
              `ইঙ্গিত: ${pieceName}-টি সঠিক ঘরে নিয়ে যাওয়ার চেষ্টা করো (${fromSq})।`
            );
            setStatusType('warning');
            setSessionState('userTurn');
          } else {
            // Second miss: fail puzzle in storage & show answer arrow
            updatePersonalPuzzle(puzzle.id, false);
            setAnswerArrow({
              startSquare: fromSq,
              endSquare: toSq,
              color: '#43A047',
            });
            const bestSan = formatUciMoveToBangla(targetBestUci, fenBeforeMove);
            setStatusMessage(`সঠিক চাল: ${bestSan}`);
            setStatusType('error');
            setSessionState('userTurn');
          }
        }
      } catch (err) {
        console.error('Puzzle move check error:', err);
        chessRef.current.undo();
        setFen(chessRef.current.fen());
        setErrorText('ইঞ্জিন সাড়া দেয়নি। আবার চেষ্টা করো।');
        setStatusMessage('আবার চেষ্টা করো');
        setStatusType('warning');
        setSessionState('userTurn');
      }
    },
    [
      puzzle,
      userStepCount,
      attemptsOnCurrentMove,
      soundEnabled,
      makeOpponentReplyAsync,
    ]
  );

  // User move trigger
  const handleUserMove = useCallback(
    (from: Square, to: Square, promotion?: PieceSymbol): boolean => {
      if (sessionState !== 'userTurn' || !puzzle) return false;

      let moveRes: ReturnType<Chess['move']> | null = null;
      try {
        const piece = chessRef.current.get(from);
        const isPromo =
          promotion ||
          (piece?.type === 'p' &&
          ((chessRef.current.turn() === 'w' && to[1] === '8') ||
            (chessRef.current.turn() === 'b' && to[1] === '1'))
            ? 'q'
            : undefined);

        moveRes = chessRef.current.move({ from, to, promotion: isPromo });
        if (!moveRes) return false;

        if (moveRes.captured) playCaptureSound(soundEnabled);
        else playMoveSound(soundEnabled);
        if (chessRef.current.inCheck()) playCheckSound(soundEnabled);

        const newFen = chessRef.current.fen();
        setFen(newFen);
        setLastUserMove({ from, to });
        setSessionState('checking');
        setStatusMessage('চাল মূল্যায়ন করা হচ্ছে...');
        setStatusType('neutral');
        setErrorText(null);

        checkUserMoveAsync(from, to, isPromo, newFen);
        return true;
      } catch {
        return false;
      }
    },
    [sessionState, puzzle, soundEnabled, checkUserMoveAsync]
  );

  return {
    chess: chessRef.current,
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
    loadPuzzle,
  };
}
